from functools import wraps
from flask import request, jsonify, g
from storage_manager import storage_manager

def quota_required(f):
    """
    Middleware to enforce per-user storage quota (uploads + deleted <= 512MB).
    Expects multipart/form-data with a 'file' field. Calculates incoming file size
    and denies with HTTP 413 if the quota would be exceeded.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Ensure a file is present; if not, let the handler return a proper 400
            uploaded_file = request.files.get('file')
            if not uploaded_file:
                return f(*args, **kwargs)

            # Measure file size without consuming the stream
            current_pos = uploaded_file.tell()
            uploaded_file.seek(0, 2)  # SEEK_END
            file_size = uploaded_file.tell()
            uploaded_file.seek(current_pos)

            user_id = g.current_user.id
            can_upload, message = storage_manager.check_quota_before_upload(user_id, file_size)
            if not can_upload:
                return jsonify({'error': 'quota_exceeded', 'message': message}), 413

            return f(*args, **kwargs)
        except Exception:
            # In case of unexpected errors, let the handler decide
            return f(*args, **kwargs)

    return decorated_function
