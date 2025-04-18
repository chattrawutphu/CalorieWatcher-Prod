export const nutritionStoreTranslations = {
  en: {
    sync: {
      noInternet: "Cannot sync data",
      noInternetDesc: "No internet connection. Please check your connection and try again.",
      authError: "Please log in again",
      authErrorDesc: "Your session has expired. Please log in to sync data.",
      syncFailed: "Sync failed",
      syncFailedDesc: "Error connecting to server.",
      updateFailed: "Server update failed",
      updateFailedDesc: "Could not update data to server.",
      timeout: "Connection timeout",
      timeoutDesc: "Connection to server took too long. Please try again.",
      syncSuccess: "Data updated successfully",
      syncSuccessDesc: "Received new data from server.",
      uploadSuccess: "Data updated successfully",
      uploadSuccessDesc: "Data saved to server successfully.",
      upToDate: "Data is up to date",
      upToDateDesc: "Your data is already up to date."
    },
    meal: {
      addSuccess: "Meal recorded successfully",
      addSuccessDesc: "Added {name} ({calories} calories)",
      removeSuccess: "Meal removed successfully",
      removeSuccessDesc: "Removed {name} ({calories} calories)"
    },
    goals: {
      updateSuccess: "Goals saved successfully",
      updateSuccessDesc: "Your nutrition goals have been updated."
    },
    mood: {
      updateSuccess: "Mood recorded successfully",
      updateSuccessDesc: "Your mood and daily notes have been saved."
    },
    water: {
      addSuccess: "Added water intake",
      addSuccessDesc: "{current} of {goal} ml ({percentage}%)",
      goalComplete: "🎉 Water goal completed!",
      goalCompleteDesc: "You've reached your {goal} ml goal for today",
      reset: "Water intake reset",
      resetDesc: "Today's water intake has been reset."
    },
    weight: {
      addSuccess: "Weight recorded successfully",
      addSuccessDesc: "Recorded {weight} kg."
    },
    data: {
      clearSuccess: "Today's food data cleared",
      clearSuccessDesc: "Water and other health data is preserved."
    }
  },
  th: {
    sync: {
      noInternet: "ไม่สามารถซิงค์ข้อมูลได้",
      noInternetDesc: "ไม่พบการเชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง",
      authError: "กรุณาล็อกอินใหม่",
      authErrorDesc: "เซสชันของคุณหมดอายุ กรุณาล็อกอินเพื่อซิงค์ข้อมูล",
      syncFailed: "ซิงค์ข้อมูลไม่สำเร็จ",
      syncFailedDesc: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์",
      updateFailed: "อัพเดทเซิร์ฟเวอร์ไม่สำเร็จ",
      updateFailedDesc: "ไม่สามารถอัพเดทข้อมูลไปยังเซิร์ฟเวอร์ได้",
      timeout: "การเชื่อมต่อหมดเวลา",
      timeoutDesc: "การเชื่อมต่อกับเซิร์ฟเวอร์ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง",
      syncSuccess: "อัพเดทข้อมูลสำเร็จ",
      syncSuccessDesc: "รับข้อมูลใหม่จากเซิร์ฟเวอร์เรียบร้อยแล้ว",
      uploadSuccess: "อัพเดทข้อมูลสำเร็จ",
      uploadSuccessDesc: "บันทึกข้อมูลไปยังเซิร์ฟเวอร์เรียบร้อยแล้ว",
      upToDate: "ข้อมูลเป็นปัจจุบัน",
      upToDateDesc: "ข้อมูลของคุณเป็นปัจจุบันแล้ว"
    },
    meal: {
      addSuccess: "บันทึกมื้ออาหารสำเร็จ",
      addSuccessDesc: "เพิ่ม {name} ({calories} แคลอรี่) แล้ว",
      removeSuccess: "ลบมื้ออาหารสำเร็จ",
      removeSuccessDesc: "ลบ {name} ({calories} แคลอรี่) แล้ว"
    },
    goals: {
      updateSuccess: "บันทึกเป้าหมายสำเร็จ",
      updateSuccessDesc: "เป้าหมายโภชนาการของคุณได้รับการอัพเดทแล้ว"
    },
    mood: {
      updateSuccess: "บันทึกอารมณ์สำเร็จ",
      updateSuccessDesc: "บันทึกอารมณ์และบันทึกประจำวันเรียบร้อยแล้ว"
    },
    water: {
      addSuccess: "เพิ่มการดื่มน้ำสำเร็จ",
      addSuccessDesc: "{current} จาก {goal} มล. ({percentage}%)",
      goalComplete: "🎉 เป้าหมายการดื่มน้ำสำเร็จ!",
      goalCompleteDesc: "คุณดื่มน้ำครบ {goal} มล. แล้ววันนี้",
      reset: "รีเซ็ตการดื่มน้ำ",
      resetDesc: "รีเซ็ตการดื่มน้ำของวันนี้เรียบร้อยแล้ว"
    },
    weight: {
      addSuccess: "บันทึกน้ำหนักสำเร็จ",
      addSuccessDesc: "บันทึกน้ำหนัก {weight} กก. เรียบร้อยแล้ว"
    },
    data: {
      clearSuccess: "ล้างข้อมูลอาหารวันนี้เรียบร้อย",
      clearSuccessDesc: "ข้อมูลน้ำและสุขภาพอื่นๆ ยังคงอยู่"
    }
  },
  ja: {
    sync: {
      noInternet: "データを同期できません",
      noInternetDesc: "インターネット接続がありません。接続を確認してもう一度お試しください。",
      authError: "再度ログインしてください",
      authErrorDesc: "セッションが期限切れです。データを同期するにはログインしてください。",
      syncFailed: "同期に失敗しました",
      syncFailedDesc: "サーバーとの接続中にエラーが発生しました。",
      updateFailed: "サーバー更新に失敗しました",
      updateFailedDesc: "サーバーにデータを更新できませんでした。",
      timeout: "接続がタイムアウトしました",
      timeoutDesc: "サーバーへの接続に時間がかかりすぎました。もう一度お試しください。",
      syncSuccess: "データが正常に更新されました",
      syncSuccessDesc: "サーバーから新しいデータを受信しました。",
      uploadSuccess: "データが正常に更新されました",
      uploadSuccessDesc: "データがサーバーに正常に保存されました。",
      upToDate: "データは最新です",
      upToDateDesc: "データはすでに最新の状態です。"
    },
    meal: {
      addSuccess: "食事が正常に記録されました",
      addSuccessDesc: "{name}（{calories}カロリー）を追加しました",
      removeSuccess: "食事が正常に削除されました",
      removeSuccessDesc: "{name}（{calories}カロリー）を削除しました"
    },
    goals: {
      updateSuccess: "目標が正常に保存されました",
      updateSuccessDesc: "栄養目標が更新されました。"
    },
    mood: {
      updateSuccess: "気分が正常に記録されました",
      updateSuccessDesc: "気分と日々のメモが保存されました。"
    },
    water: {
      addSuccess: "水分摂取を追加しました",
      addSuccessDesc: "{goal}mlのうち{current}ml（{percentage}%）",
      goalComplete: "🎉 水分目標達成！",
      goalCompleteDesc: "今日の{goal}ml目標に到達しました",
      reset: "水分摂取をリセットしました",
      resetDesc: "今日の水分摂取量がリセットされました。"
    },
    weight: {
      addSuccess: "体重が正常に記録されました",
      addSuccessDesc: "{weight}kgを記録しました。"
    },
    data: {
      clearSuccess: "今日の食事データをクリアしました",
      clearSuccessDesc: "水分と他の健康データは保持されています。"
    }
  },
  zh: {
    sync: {
      noInternet: "无法同步数据",
      noInternetDesc: "没有互联网连接。请检查您的连接并重试。",
      authError: "请重新登录",
      authErrorDesc: "您的会话已过期。请登录以同步数据。",
      syncFailed: "同步失败",
      syncFailedDesc: "连接服务器时出错。",
      updateFailed: "服务器更新失败",
      updateFailedDesc: "无法更新数据到服务器。",
      timeout: "连接超时",
      timeoutDesc: "连接服务器花费的时间太长。请重试。",
      syncSuccess: "数据更新成功",
      syncSuccessDesc: "已从服务器接收新数据。",
      uploadSuccess: "数据更新成功",
      uploadSuccessDesc: "数据已成功保存到服务器。",
      upToDate: "数据已是最新",
      upToDateDesc: "您的数据已经是最新的。"
    },
    meal: {
      addSuccess: "餐食记录成功",
      addSuccessDesc: "已添加 {name}（{calories} 卡路里）",
      removeSuccess: "餐食移除成功",
      removeSuccessDesc: "已移除 {name}（{calories} 卡路里）"
    },
    goals: {
      updateSuccess: "目标保存成功",
      updateSuccessDesc: "您的营养目标已更新。"
    },
    mood: {
      updateSuccess: "心情记录成功",
      updateSuccessDesc: "您的心情和日常笔记已保存。"
    },
    water: {
      addSuccess: "添加了水分摄入",
      addSuccessDesc: "{current}/{goal} 毫升（{percentage}%）",
      goalComplete: "🎉 水分目标完成！",
      goalCompleteDesc: "您今天已达到 {goal} 毫升的目标",
      reset: "水分摄入重置",
      resetDesc: "今天的水分摄入已重置。"
    },
    weight: {
      addSuccess: "体重记录成功",
      addSuccessDesc: "已记录 {weight} 公斤。"
    },
    data: {
      clearSuccess: "今天的食物数据已清除",
      clearSuccessDesc: "水分和其他健康数据已保留。"
    }
  }
}; 