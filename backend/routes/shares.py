from flask import Blueprint, request, jsonify, g
import re
from database import File, User, Share, db_manager
from middleware.auth import auth_required
import psycopg2

shares_bp = Blueprint('shares', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_permission(permission):
    """Validate permission level"""
    valid_permissions = ['read', 'write']
    return permission in valid_permissions

@shares_bp.route('/api/files/<file_id>/share', methods=['POST'])
@auth_required
def share_file(file_id):
    """Share a file with another user"""
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract and validate required fields
        grantee_email = data.get('grantee_email', '').strip().lower()
        permission = data.get('permission', 'read').strip().lower()
        
        # Validate required fields
        if not grantee_email:
            return jsonify({'error': 'Grantee email is required'}), 400
        
        if not validate_email(grantee_email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if not validate_permission(permission):
            return jsonify({'error': 'Invalid permission. Must be "read" or "write"'}), 400
        
        # Check if file exists and current user is the owner
        file = File.query.filter_by(id=file_id, owner_id=g.current_user.id).first()
        if not file:
            return jsonify({'error': 'File not found or you are not the owner'}), 404
        
        # Find grantee user
        grantee_user = User.find_by_email(grantee_email)
        if not grantee_user:
            return jsonify({'error': 'User with this email not found'}), 404
        
        # Prevent sharing with self
        if grantee_user.id == g.current_user.id:
            return jsonify({'error': 'Cannot share file with yourself'}), 400
        
        # Check if file is already shared with this user
        existing_share = Share.find_by_file_and_grantee(file_id, grantee_user.id)
        if existing_share:
            # Update existing share permission
            existing_share.permission = permission
            db.session.commit()
            
            return jsonify({
                'message': 'File share updated successfully',
                'share': existing_share.to_dict(),
                'action': 'updated'
            }), 200
        
        # Create new share
        new_share = Share(
            file_id=file_id,
            grantee_user_id=grantee_user.id,
            permission=permission
        )
        
        db.session.add(new_share)
        db.session.commit()
        
        return jsonify({
            'message': 'File shared successfully',
            'share': new_share.to_dict(),
            'action': 'created'
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Share already exists'}), 409
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'File sharing failed', 'details': str(e)}), 500

@shares_bp.route('/api/files/<file_id>/share/<grantee_user_id>', methods=['DELETE'])
@auth_required
def revoke_file_share(file_id, grantee_user_id):
    """Revoke file share from a user"""
    try:
        # Check if file exists and current user is the owner
        file = File.query.filter_by(id=file_id, owner_id=g.current_user.id).first()
        if not file:
            return jsonify({'error': 'File not found or you are not the owner'}), 404
        
        # Find the share
        share = Share.find_by_file_and_grantee(file_id, grantee_user_id)
        if not share:
            return jsonify({'error': 'Share not found'}), 404
        
        # Delete the share
        db.session.delete(share)
        db.session.commit()
        
        return jsonify({
            'message': 'File share revoked successfully',
            'file_id': file_id,
            'grantee_user_id': grantee_user_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Share revocation failed', 'details': str(e)}), 500

@shares_bp.route('/api/shared', methods=['GET'])
@auth_required
def list_shared_files():
    """List files that have been shared with the current user"""
    try:
        # Get optional query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)  # Max 100 per page
        
        # Get shares for current user
        shares_query = Share.query.filter_by(grantee_user_id=g.current_user.id)\
                                 .join(File)\
                                 .order_by(Share.created_at.desc())
        
        # Paginate results
        shares_pagination = shares_query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        shares_list = [share.to_dict(include_file_info=True) for share in shares_pagination.items]
        
        return jsonify({
            'shared_files': shares_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': shares_pagination.total,
                'pages': shares_pagination.pages,
                'has_next': shares_pagination.has_next,
                'has_prev': shares_pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to list shared files', 'details': str(e)}), 500

@shares_bp.route('/api/files/<file_id>/shares', methods=['GET'])
@auth_required
def list_file_shares(file_id):
    """List all users who have access to a specific file (owner only)"""
    try:
        # Check if file exists and current user is the owner
        file = File.query.filter_by(id=file_id, owner_id=g.current_user.id).first()
        if not file:
            return jsonify({'error': 'File not found or you are not the owner'}), 404
        
        # Get all shares for this file
        shares = Share.get_file_shares(file_id)
        shares_list = [share.to_dict() for share in shares]
        
        return jsonify({
            'file_id': file_id,
            'filename': file.filename,
            'shares': shares_list,
            'total_shares': len(shares_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to list file shares', 'details': str(e)}), 500

@shares_bp.route('/api/shares/stats', methods=['GET'])
@auth_required
def get_sharing_stats():
    """Get sharing statistics for the current user"""
    try:
        # Files shared by current user (as owner)
        files_shared_by_user = db.session.query(db.func.count(Share.id))\
                                        .join(File)\
                                        .filter(File.owner_id == g.current_user.id)\
                                        .scalar() or 0
        
        # Files shared with current user (as grantee)
        files_shared_with_user = Share.query.filter_by(grantee_user_id=g.current_user.id).count()
        
        # Unique users who have shared files with current user
        unique_sharers = db.session.query(db.func.count(db.distinct(File.owner_id)))\
                                  .join(Share)\
                                  .filter(Share.grantee_user_id == g.current_user.id)\
                                  .scalar() or 0
        
        # Unique users current user has shared files with
        unique_grantees = db.session.query(db.func.count(db.distinct(Share.grantee_user_id)))\
                                   .join(File)\
                                   .filter(File.owner_id == g.current_user.id)\
                                   .scalar() or 0
        
        return jsonify({
            'stats': {
                'files_you_shared': files_shared_by_user,
                'files_shared_with_you': files_shared_with_user,
                'users_who_shared_with_you': unique_sharers,
                'users_you_shared_with': unique_grantees
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get sharing stats', 'details': str(e)}), 500
