"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ToastTestPage() {
  const { locale } = useLanguage();

  const showDefaultToast = () => {
    toast({
      title: locale === 'en' ? 'Default Toast' :
             locale === 'th' ? 'ข้อความแจ้งเตือนปกติ' :
             locale === 'ja' ? 'デフォルトトースト' : '默认提示',
      description: locale === 'en' ? 'This is a default toast message' :
                   locale === 'th' ? 'นี่คือข้อความแจ้งเตือนปกติ' :
                   locale === 'ja' ? 'これはデフォルトのトーストメッセージです' : '这是一个默认提示消息',
    });
  };

  const showSuccessToast = () => {
    toast({
      title: "Successfully completed!",
      description: "Your operation has been completed successfully.",
      duration: 3000
    });
  };

  const showErrorToast = () => {
    toast({
      variant: "destructive",
      title: "Error occurred",
      description: "There was a problem with your request.",
      duration: 3000
    });
  };

  const showWarningToast = () => {
    toast({
      title: "Warning",
      description: "This action might have consequences.",
      duration: 3000
    });
  };

  const showInfoToast = () => {
    toast({
      title: "Information",
      description: "Here's some information you might want to know.",
      duration: 3000
    });
  };

  const showLongToast = () => {
    toast({
      title: locale === 'en' ? 'Long Duration' :
             locale === 'th' ? 'ระยะเวลานาน' :
             locale === 'ja' ? '長い期間' : '长时间',
      description: locale === 'en' ? 'This toast will stay visible for 10 seconds' :
                   locale === 'th' ? 'ข้อความแจ้งเตือนนี้จะแสดงเป็นเวลา 10 วินาที' :
                   locale === 'ja' ? 'このトーストは10秒間表示されます' : '此提示将显示10秒',
      duration: 10000,
    });
  };

  const showPersistentToast = () => {
    toast({
      title: locale === 'en' ? 'Persistent Toast' :
             locale === 'th' ? 'ข้อความแจ้งเตือนถาวร' :
             locale === 'ja' ? '永続的なトースト' : '持久提示',
      description: locale === 'en' ? 'This toast will not disappear automatically' :
                   locale === 'th' ? 'ข้อความแจ้งเตือนนี้จะไม่หายไปโดยอัตโนมัติ' :
                   locale === 'ja' ? 'このトーストは自動的に消えません' : '此提示不会自动消失',
      duration: Infinity,
    });
  };

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">
        {locale === 'en' ? 'Toast Notification Test' :
         locale === 'th' ? 'ทดสอบการแจ้งเตือนแบบ Toast' :
         locale === 'ja' ? 'トースト通知テスト' : '提示通知测试'}
      </h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {locale === 'en' ? 'Toast Variants' :
             locale === 'th' ? 'รูปแบบการแจ้งเตือน' :
             locale === 'ja' ? 'トーストバリアント' : '提示变体'}
          </CardTitle>
          <CardDescription>
            {locale === 'en' ? 'Click to test different toast styles' :
             locale === 'th' ? 'คลิกเพื่อทดสอบรูปแบบการแจ้งเตือนที่แตกต่างกัน' :
             locale === 'ja' ? '異なるトーストスタイルをテストするにはクリックしてください' : 
             '点击测试不同的提示样式'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Button onClick={showDefaultToast} variant="outline">
              {locale === 'en' ? 'Default' : locale === 'th' ? 'ปกติ' : locale === 'ja' ? 'デフォルト' : '默认'}
            </Button>
            <Button onClick={showSuccessToast} variant="outline" className="text-green-600">
              {locale === 'en' ? 'Success' : locale === 'th' ? 'สำเร็จ' : locale === 'ja' ? '成功' : '成功'}
            </Button>
            <Button onClick={showErrorToast} variant="outline" className="text-red-600">
              {locale === 'en' ? 'Error' : locale === 'th' ? 'ข้อผิดพลาด' : locale === 'ja' ? 'エラー' : '错误'}
            </Button>
            <Button onClick={showWarningToast} variant="outline" className="text-yellow-600">
              {locale === 'en' ? 'Warning' : locale === 'th' ? 'คำเตือน' : locale === 'ja' ? '警告' : '警告'}
            </Button>
            <Button onClick={showInfoToast} variant="outline" className="text-blue-600">
              {locale === 'en' ? 'Info' : locale === 'th' ? 'ข้อมูล' : locale === 'ja' ? '情報' : '信息'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {locale === 'en' ? 'Duration Options' :
             locale === 'th' ? 'ตัวเลือกระยะเวลา' :
             locale === 'ja' ? '期間オプション' : '持续时间选项'}
          </CardTitle>
          <CardDescription>
            {locale === 'en' ? 'Test different toast duration settings' :
             locale === 'th' ? 'ทดสอบการตั้งค่าระยะเวลาการแจ้งเตือนที่แตกต่างกัน' :
             locale === 'ja' ? '異なるトースト期間設定をテストする' : 
             '测试不同的提示持续时间设置'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={showLongToast} variant="outline">
              {locale === 'en' ? 'Long (10s)' : 
               locale === 'th' ? 'นาน (10 วินาที)' : 
               locale === 'ja' ? '長い (10秒)' : '长时间 (10秒)'}
            </Button>
            <Button onClick={showPersistentToast} variant="outline">
              {locale === 'en' ? 'Persistent' : 
               locale === 'th' ? 'ถาวร' : 
               locale === 'ja' ? '永続的' : '持久'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 