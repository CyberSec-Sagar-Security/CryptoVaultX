import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { HardDrive, Trash2, Download, Archive } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function StorageTab() {
  const storageUsed = 47.2;
  const storageLimit = 100;
  const storagePercentage = (storageUsed / storageLimit) * 100;

  const storageBreakdown = [
    { category: 'Documents', size: 18.5, color: 'bg-blue-500' },
    { category: 'Images', size: 12.8, color: 'bg-green-500' },
    { category: 'Videos', size: 10.2, color: 'bg-purple-500' },
    { category: 'Audio', size: 3.4, color: 'bg-orange-500' },
    { category: 'Other', size: 2.3, color: 'bg-gray-500' }
  ];

  const handleCleanup = () => {
    toast.success('Storage cleanup completed!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Used Storage</span>
              <Badge variant="secondary">
                {storageUsed} GB of {storageLimit} GB
              </Badge>
            </div>
            <Progress value={storagePercentage} className="h-3" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {storageLimit - storageUsed} GB remaining
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
          <CardHeader>
            <CardTitle>Storage Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storageBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${item.color}`} />
                    <span className="text-sm">{item.category}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.size} GB
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
          <CardHeader>
            <CardTitle>Storage Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleCleanup}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clean Up Temporary Files
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Archive className="h-4 w-4 mr-2" />
              Archive Old Files
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Download All Files
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <HardDrive className="h-4 w-4 mr-2" />
              Upgrade Storage
            </Button>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
          <CardHeader>
            <CardTitle>Auto-Cleanup Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Automatically delete temporary files and empty trash after 30 days
            </div>
            <Button variant="outline" className="w-full">
              Configure Auto-Cleanup
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}