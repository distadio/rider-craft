import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const IconManager = () => {
  const { t } = useTranslation();
  const customIcons = useStore(state => state.customIcons);
  const addCustomIcon = useStore(state => state.addCustomIcon);
  const deleteCustomIcon = useStore(state => state.deleteCustomIcon);
  const isAdmin = useStore(state => state.isAdmin);

  const [uploading, setUploading] = useState(false);
  const [newIconName, setNewIconName] = useState('');
  const [newIconCategory, setNewIconCategory] = useState('custom');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) {
    return null;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('svg') && !file.type.includes('png')) {
      toast.error(t('admin.onlySvgPng'));
      return;
    }

    if (file.size > 500000) {
      toast.error(t('admin.fileSizeLimit'));
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const fileContent = event.target?.result as string;
        
        addCustomIcon({
          name: newIconName || file.name.replace(/\.[^/.]+$/, ''),
          category: newIconCategory,
          svgData: fileContent,
          isCustom: true,
          createdBy: 'admin'
        });

        setNewIconName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        toast.success(t('admin.iconUploaded'));
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading icon:', error);
      toast.error(t('admin.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (iconId: string) => {
    if (confirm(t('admin.confirmDelete'))) {
      deleteCustomIcon(iconId);
      toast.success(t('admin.iconDeleted'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.iconManager')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">{t('admin.uploadNewIcon')}</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="icon-name">{t('admin.iconName')}</Label>
              <Input
                id="icon-name"
                type="text"
                value={newIconName}
                onChange={(e) => setNewIconName(e.target.value)}
                placeholder={t('admin.iconNamePlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="icon-category">{t('admin.category')}</Label>
              <Select value={newIconCategory} onValueChange={setNewIconCategory}>
                <SelectTrigger id="icon-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">{t('iconLibrary.categories.custom')}</SelectItem>
                  <SelectItem value="drums">{t('iconLibrary.categories.drums')}</SelectItem>
                  <SelectItem value="guitars">{t('iconLibrary.categories.guitars')}</SelectItem>
                  <SelectItem value="mics">{t('iconLibrary.categories.mics')}</SelectItem>
                  <SelectItem value="monitors">{t('iconLibrary.categories.monitors')}</SelectItem>
                  <SelectItem value="keys">{t('iconLibrary.categories.keys')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="icon-file">{t('admin.uploadFile')}</Label>
              <Input
                id="icon-file"
                ref={fileInputRef}
                type="file"
                accept=".svg,.png"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('admin.fileRequirements')}
              </p>
            </div>

            {uploading && (
              <p className="text-sm text-accent">{t('admin.uploading')}</p>
            )}
          </div>
        </div>

        {/* Icons Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t('admin.customIcons')} ({customIcons.length})
          </h3>

          {customIcons.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t('admin.noCustomIcons')}
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {customIcons.map(icon => (
                <div
                  key={icon.id}
                  className="border border-border rounded-lg p-4 hover:border-accent transition-colors relative group bg-card"
                >
                  <div className="aspect-square flex items-center justify-center mb-2">
                    {icon.svgData.startsWith('data:image/svg') || icon.svgData.startsWith('<svg') ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: icon.svgData }}
                        className="w-full h-full"
                      />
                    ) : (
                      <img
                        src={icon.svgData}
                        alt={icon.name}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  
                  <div className="text-sm font-medium text-center truncate">
                    {icon.name}
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    {icon.category}
                  </div>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(icon.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                    title={t('admin.deleteIcon')}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
