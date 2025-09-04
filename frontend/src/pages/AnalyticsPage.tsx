import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Files, HardDrive, Share2, Download, Activity, PieChart, Clock, FileText, Image, Video, FileIcon } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <div className="glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-7 w-7 text-purple-300" />
                  Analytics
                </h1>
                <p className="text-purple-200 text-sm mt-1">Track your storage usage and file activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 border border-purple-400/30">
            <div className="flex items-center">
              <div className="glass-card p-3 border border-purple-400/30 rounded-lg">
                <Files className="h-6 w-6 text-purple-300" />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-purple-200">
                  Total Files
                </dt>
                <dd className="text-2xl font-bold text-white">0</dd>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-purple-400/30">
            <div className="flex items-center">
              <div className="glass-card p-3 border border-purple-400/30 rounded-lg">
                <HardDrive className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-purple-200">
                  Storage Used
                </dt>
                <dd className="text-2xl font-bold text-white">0 MB</dd>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-purple-400/30">
            <div className="flex items-center">
              <div className="glass-card p-3 border border-purple-400/30 rounded-lg">
                <Share2 className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-purple-200">
                  Shared Files
                </dt>
                <dd className="text-2xl font-bold text-white">0</dd>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-purple-400/30">
            <div className="flex items-center">
              <div className="glass-card p-3 border border-purple-400/30 rounded-lg">
                <Download className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-purple-200">
                  Downloads
                </dt>
                <dd className="text-2xl font-bold text-white">0</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6 border border-purple-400/30">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-300" />
              Upload Activity
            </h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-purple-400/30 rounded-lg">
              <div className="text-center">
                <div className="glass-card p-6 border border-purple-400/30 inline-block rounded-full mb-4">
                  <BarChart3 className="h-12 w-12 text-purple-300" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No data available</h3>
                <p className="text-purple-200">
                  Upload some files to see activity charts.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-purple-400/30">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-300" />
              File Types Distribution
            </h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-purple-400/30 rounded-lg">
              <div className="text-center">
                <div className="glass-card p-6 border border-purple-400/30 inline-block rounded-full mb-4">
                  <PieChart className="h-12 w-12 text-purple-300" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No data available</h3>
                <p className="text-purple-200">
                  Upload files to see type distribution.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6 border border-purple-400/30 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-300" />
            Recent Activity
          </h3>
          <div className="text-center py-12">
            <div className="glass-card p-6 border border-purple-400/30 inline-block rounded-full mb-4">
              <Clock className="h-12 w-12 text-purple-300" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No recent activity</h3>
            <p className="text-purple-200">
              Your file upload and sharing activity will appear here.
            </p>
          </div>
        </div>

        {/* Storage Breakdown */}
        <div className="glass-card p-6 border border-purple-400/30">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-purple-300" />
            Storage Breakdown
          </h3>
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-3 w-32">
                <FileText className="h-5 w-5 text-blue-400" />
                <span className="text-white font-medium">Documents</span>
              </div>
              <div className="flex-1 ml-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="text-purple-200">0 MB</div>
                  <div className="text-purple-300">0%</div>
                </div>
                <div className="bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center space-x-3 w-32">
                <Image className="h-5 w-5 text-green-400" />
                <span className="text-white font-medium">Images</span>
              </div>
              <div className="flex-1 ml-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="text-purple-200">0 MB</div>
                  <div className="text-purple-300">0%</div>
                </div>
                <div className="bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center space-x-3 w-32">
                <Video className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-medium">Videos</span>
              </div>
              <div className="flex-1 ml-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="text-purple-200">0 MB</div>
                  <div className="text-purple-300">0%</div>
                </div>
                <div className="bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center space-x-3 w-32">
                <FileIcon className="h-5 w-5 text-purple-400" />
                <span className="text-white font-medium">Other</span>
              </div>
              <div className="flex-1 ml-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="text-purple-200">0 MB</div>
                  <div className="text-purple-300">0%</div>
                </div>
                <div className="bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
