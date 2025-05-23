export const aiAssistantTranslations = {
  en: {
    title: "AI Food Assistant",
    subtitle: "Analyze food with GPT-4 Vision to track nutritional values",
    featureTitle: "Automatic Food Analysis",
    featureDescription: "Upload food images for AI to analyze nutrients and calories",
    featureTags: {
      gpt4Vision: "GPT-4 Vision",
      supportAllFood: "Supports international cuisine",
      highAccuracy: "High accuracy"
    },
    upload: {
      title: "Upload Food Image",
      dragDrop: "Drag files here or click to upload",
      sizeLimit: "Maximum image size: 5MB",
      formats: ["JPG", "PNG", "WebP", "HEIC"]
    },
    uploadOptions: {
      gallery: "Choose from Gallery",
      camera: "Take Food Photo"
    },
    addFood: {
      title: "Add Food",
      subtitle: "Track your meals easily",
      customFood: "Add Custom Food",
      submitButton: "Add Food"
    },
    analyze: {
      button: "Analyze with GPT-4 Vision",
      apiUsage: "Uses 1 OpenAI API quota per analysis",
      highAccuracy: "High accuracy"
    },
    analyzing: {
      title: "Analyzing with GPT-4 Vision",
      pleaseWait: "Please wait...",
      steps: {
        step1: "Identifying food type and details",
        step2: "Analyzing nutritional values and key ingredients",
        step3: "Estimating calories and nutrients"
      }
    },
    result: {
      nutritionalInfo: "Nutritional Information",
      per: "per",
      totalCalories: "Total Calories",
      protein: "Protein",
      carbs: "Carbohydrates",
      fat: "Fat",
      analyzedBy: "Analyzed by OpenAI GPT-4 Vision | Nutritional values are estimates"
    },
    addMeal: {
      title: "Record Meal",
      subtitle: "Record the nutrients from this meal",
      mealType: "Meal Type",
      mealTypes: {
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        snack: "Snack"
      },
      quantity: "Quantity",
      total: "Total",
      saveButton: "Save Meal",
      analyzeAgain: "Analyze Again"
    },
    success: {
      title: "Data Saved Successfully",
      message: "Added {food} {quantity} {unit} to {mealType} list",
      unit: "unit | units",
      goToDashboard: "Go to Dashboard",
      takeNewPhoto: "Take New Photo"
    },
    foodCategories: {
      protein: "Protein",
      vegetable: "Vegetable",
      fruit: "Fruit",
      grain: "Grain/Starch",
      dairy: "Dairy",
      snack: "Snack",
      beverage: "Beverage",
      other: "Other"
    },
    tips: {
      title: "GPT-4 Vision Tips",
      tip1: "Take food photos from above, showing the entire dish with good lighting",
      tip2: "GPT-4 Vision can analyze Thai and international cuisine with better accuracy",
      tip3: "If results are incorrect, you can analyze again",
      tip4: "Nutritional values are AI estimates and may vary"
    },
    techInfo: {
      title: "OpenAI GPT-4 Vision Technology",
      description: "The system uses advanced AI to analyze food images and estimate nutritional values"
    },
    mobileNav: {
      common: {
        back: "Back",
        search: "Search",
        searchPlaceholder: "Search food in database...",
        calories: "calories",
        per: "per",
        noResults: "No results found",
        quickActions: "Quick Actions",
        commonFoodsDesc: "Choose from frequently used items",
        customFoodDesc: "Create your own food entry",
        barcodeScannerDesc: "Get nutrition info from barcode",
        recentFoodsDesc: "View your recently added foods"
      },
      commonFoods: {
        title: "Common Foods",
        categories: {
          protein: "Protein",
          vegetable: "Vegetable",
          fruit: "Fruit",
          grain: "Grain",
          dairy: "Dairy",
          snack: "Snack",
          beverage: "Beverage",
          other: "Other"
        }
      },
      customFood: {
        title: "Custom Food",
        addNew: "Add Custom Food",
        addNewTitle: "Add New Custom Food",
        yourCustomFoods: "Your Custom Foods",
        createFirst: "Create Your First Custom Food",
        noCustomFoods: "No custom foods yet.",
        foodName: "Food Name",
        foodNamePlaceholder: "e.g. Homemade Smoothie",
        foodCategory: "Food Category",
        selectCategory: "Select a category",
        calories: "Calories",
        protein: "Protein (g)",
        carbs: "Carbs (g)",
        fat: "Fat (g)",
        servingSize: "Serving Size",
        badge: "Custom",
        caloriesPer: "calories per"
      },
      recentFoods: {
        title: "Recent Foods",
        noFoods: "No recent foods found"
      },
      foodDetail: {
        back: "Back",
        mealType: "Meal Type",
        mealTypes: {
          breakfast: "Breakfast",
          lunch: "Lunch",
          dinner: "Dinner",
          snack: "Snack"
        },
        quantity: "Quantity",
        totalCalories: "Total Calories",
        addToMeal: "Add to Meal",
        editFood: "Edit Food",
        save: "Save",
        saveChanges: "Save Changes",
        servingSize: "Serving Size",
        saveCustomFood: "Add to My Custom Foods",
        saveCustomFoodDesc: "Save this food for easier access in the future",
        saveButton: "Save to My Custom Foods",
        usingCustomFood: "Using your saved custom food data",
        warningTitle: "Changes only affect this item",
        warningDesc: "These edits won't affect previously saved entries of this food or templates"
      },
      barcodeScanner: {
        title: "Scan Barcode",
        scanInstructions: "Scan a barcode on a food product",
        openCamera: "Open Camera",
        cancelScan: "Cancel",
        searching: "Searching...",
        manualInput: "Or enter a barcode manually:",
        searchButton: "Search",
        testBarcodes: "Try with barcodes: 8851959131012, 8850329112224, 8858891302701",
        errors: {
          invalidBarcode: "Invalid barcode. Please try again.",
          notFound: "No food data found for this barcode.",
          cameraPermission: "Camera access was denied. Please enable camera access in your browser settings.",
          noCamera: "No camera found on this device. Please use a device with a camera.",
          general: "Error accessing camera: "
        }
      },
      aiAssistant: {
        title: "AI Food Analysis",
        description: "Upload food images for AI analysis",
        buttonText: "Analyze with AI"
      },
      navigation: {
        home: "Home",
        dashboard: "Dashboard",
        add: "Add",
        history: "Stats",
        settings: "Settings",
        close: "Close"
      }
    },
    app: {
      sync: {
        syncing: "Syncing data...",
        syncFailed: "Sync failed",
        syncComplete: "Data synced successfully"
      }
    }
  },
  th: {
    title: "AI Food Assistant",
    subtitle: "วิเคราะห์อาหารด้วย GPT-4 Vision เพื่อติดตามคุณค่าทางโภชนาการ",
    featureTitle: "วิเคราะห์รูปอาหารอัตโนมัติ",
    featureDescription: "อัปโหลดรูปอาหารเพื่อให้ AI วิเคราะห์สารอาหารและแคลอรี่",
    featureTags: {
      gpt4Vision: "GPT-4 Vision",
      supportAllFood: "รองรับอาหารไทย",
      highAccuracy: "แม่นยำสูง"
    },
    upload: {
      title: "อัปโหลดรูปอาหาร",
      dragDrop: "ลากไฟล์มาวางที่นี่ หรือคลิกเพื่ออัปโหลด",
      sizeLimit: "รองรับรูปภาพขนาดไม่เกิน 5MB",
      formats: ["JPG", "PNG", "WebP", "HEIC"]
    },
    uploadOptions: {
      gallery: "เลือกจากแกลเลอรี่",
      camera: "ถ่ายภาพอาหาร"
    },
    addFood: {
      title: "เพิ่มอาหาร",
      subtitle: "บันทึกมื้ออาหารของคุณอย่างง่ายดาย",
      customFood: "เพิ่มอาหารกำหนดเอง",
      submitButton: "เพิ่มอาหาร"
    },
    analyze: {
      button: "วิเคราะห์ด้วย GPT-4 Vision",
      apiUsage: "ใช้ OpenAI API quota 1 ครั้งต่อการวิเคราะห์",
      highAccuracy: "แม่นยำสูง"
    },
    analyzing: {
      title: "กำลังวิเคราะห์ด้วย GPT-4 Vision",
      pleaseWait: "กรุณารอสักครู่...",
      steps: {
        step1: "ระบุชนิดและรายละเอียดของอาหาร",
        step2: "วิเคราะห์คุณค่าทางโภชนาการและส่วนประกอบสำคัญ",
        step3: "ประมาณแคลอรี่และสารอาหาร"
      }
    },
    result: {
      nutritionalInfo: "ข้อมูลโภชนาการ",
      per: "ต่อ",
      totalCalories: "แคลอรี่ทั้งหมด",
      protein: "โปรตีน",
      carbs: "คาร์โบไฮเดรต",
      fat: "ไขมัน",
      analyzedBy: "วิเคราะห์โดย OpenAI GPT-4 Vision | ข้อมูลโภชนาการเป็นการประมาณการ"
    },
    addMeal: {
      title: "บันทึกมื้ออาหาร",
      subtitle: "บันทึกค่าสารอาหารที่ได้รับจากมื้อนี้",
      mealType: "มื้ออาหาร",
      mealTypes: {
        breakfast: "เช้า",
        lunch: "กลางวัน",
        dinner: "เย็น",
        snack: "ของว่าง"
      },
      quantity: "จำนวน",
      total: "รวม",
      saveButton: "บันทึกมื้ออาหาร",
      analyzeAgain: "วิเคราะห์ใหม่"
    },
    success: {
      title: "บันทึกข้อมูลสำเร็จ",
      message: "เพิ่ม {food} จำนวน {quantity} {unit} เข้าในรายการมื้อ{mealType}แล้ว",
      unit: "หน่วย | หน่วย",
      goToDashboard: "ไปที่หน้าหลัก",
      takeNewPhoto: "ถ่ายภาพใหม่"
    },
    foodCategories: {
      protein: "อาหารโปรตีน",
      vegetable: "ผัก",
      fruit: "ผลไม้",
      grain: "ธัญพืช/แป้ง",
      dairy: "นม/ผลิตภัณฑ์นม",
      snack: "ขนม/ของว่าง",
      beverage: "เครื่องดื่ม",
      other: "อื่นๆ"
    },
    tips: {
      title: "เคล็ดลับการใช้ GPT-4 Vision",
      tip1: "ถ่ายภาพอาหารในมุมบนลงล่าง ให้เห็นอาหารทั้งจาน/ชาม และมีแสงสว่างเพียงพอ",
      tip2: "GPT-4 Vision สามารถวิเคราะห์อาหารไทยและอาหารนานาชาติได้หลากหลายกว่า",
      tip3: "หากผลลัพธ์ไม่ตรงกับความต้องการ สามารถกดวิเคราะห์ใหม่ได้",
      tip4: "ค่าสารอาหารเป็นการประมาณการจาก AI ซึ่งอาจคลาดเคลื่อนได้"
    },
    techInfo: {
      title: "เทคโนโลยี OpenAI GPT-4 Vision",
      description: "ระบบใช้ AI ขั้นสูงในการวิเคราะห์รูปภาพอาหารและประมาณค่าโภชนาการ"
    },
    mobileNav: {
      common: {
        back: "กลับ",
        search: "ค้นหา",
        searchPlaceholder: "ค้นหาอาหารในฐานข้อมูล...",
        calories: "แคลอรี่",
        per: "ต่อ",
        noResults: "ไม่พบผลลัพธ์",
        quickActions: "ทางลัด",
        commonFoodsDesc: "เลือกจากรายการอาหารที่ใช้บ่อย",
        customFoodDesc: "สร้างรายการอาหารของคุณเอง",
        barcodeScannerDesc: "รับข้อมูลโภชนาการจากบาร์โค้ด",
        recentFoodsDesc: "ดูอาหารที่เพิ่มล่าสุดของคุณ"
      },
      commonFoods: {
        title: "อาหารทั่วไป",
        categories: {
          protein: "โปรตีน",
          vegetable: "ผัก",
          fruit: "ผลไม้",
          grain: "ธัญพืช/แป้ง",
          dairy: "นม/ผลิตภัณฑ์นม",
          snack: "ขนม/ของว่าง",
          beverage: "เครื่องดื่ม",
          other: "อื่นๆ"
        }
      },
      customFood: {
        title: "อาหารกำหนดเอง",
        addNew: "เพิ่มอาหารกำหนดเอง",
        addNewTitle: "เพิ่มอาหารกำหนดเองใหม่",
        yourCustomFoods: "อาหารกำหนดเองของคุณ",
        createFirst: "สร้างอาหารกำหนดเองแรกของคุณ",
        noCustomFoods: "ยังไม่มีอาหารกำหนดเอง",
        foodName: "ชื่ออาหาร",
        foodNamePlaceholder: "ตัวอย่างเช่น Smoothie ทำเอง",
        foodCategory: "ประเภทอาหาร",
        selectCategory: "เลือกประเภท",
        calories: "แคลอรี่",
        protein: "โปรตีน (กรัม)",
        carbs: "คาร์โบไฮเดรต (กรัม)",
        fat: "ไขมัน (กรัม)",
        servingSize: "ขนาดบริโภค",
        badge: "กำหนดเอง",
        caloriesPer: "แคลอรี่ต่อ"
      },
      recentFoods: {
        title: "อาหารล่าสุด",
        noFoods: "ไม่พบอาหารล่าสุด"
      },
      foodDetail: {
        back: "กลับ",
        mealType: "มื้ออาหาร",
        mealTypes: {
          breakfast: "เช้า",
          lunch: "กลางวัน",
          dinner: "เย็น",
          snack: "ของว่าง"
        },
        quantity: "จำนวน",
        totalCalories: "แคลอรี่ทั้งหมด",
        addToMeal: "เพิ่มลงในมื้ออาหาร",
        editFood: "แก้ไขอาหาร",
        save: "บันทึก",
        saveChanges: "บันทึกการเปลี่ยนแปลง",
        servingSize: "ขนาดเสิร์ฟ",
        saveCustomFood: "เพิ่มในอาหารของฉัน",
        saveCustomFoodDesc: "บันทึกอาหารนี้เพื่อใช้งานได้ง่ายในอนาคต",
        saveButton: "บันทึกในอาหารของฉัน",
        usingCustomFood: "กำลังใช้ข้อมูลอาหารที่คุณบันทึกไว้",
        warningTitle: "การเปลี่ยนแปลงนี้จะมีผลกับรายการนี้เท่านั้น",
        warningDesc: "การแก้ไขนี้ไม่มีผลกับอาหารชนิดนี้ที่เคยบันทึกไว้ หรือต้นแบบของอาหารในรายการส่วนตัว"
      },
      barcodeScanner: {
        title: "สแกนบาร์โค้ด",
        scanInstructions: "สแกนบาร์โค้ดบนผลิตภัณฑ์อาหาร",
        openCamera: "เปิดกล้อง",
        cancelScan: "ยกเลิก",
        searching: "กำลังค้นหาข้อมูล...",
        manualInput: "หรือป้อนบาร์โค้ดด้วยตนเอง:",
        searchButton: "ค้นหา",
        testBarcodes: "ทดลองด้วยบาร์โค้ด: 8851959131012, 8850329112224, 8858891302701",
        errors: {
          invalidBarcode: "บาร์โค้ดไม่ถูกต้อง กรุณาลองอีกครั้ง",
          notFound: "ไม่พบข้อมูลอาหารจากบาร์โค้ดนี้",
          cameraPermission: "คุณไม่ได้อนุญาตให้เข้าถึงกล้อง กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่าเบราว์เซอร์",
          noCamera: "ไม่พบกล้องบนอุปกรณ์นี้ กรุณาใช้อุปกรณ์ที่มีกล้อง",
          general: "ไม่สามารถเข้าถึงกล้องได้: "
        }
      },
      aiAssistant: {
        title: "วิเคราะห์อาหารด้วย AI",
        description: "อัปโหลดรูปอาหารเพื่อวิเคราะห์ด้วย AI",
        buttonText: "วิเคราะห์ด้วย AI"
      },
      navigation: {
        home: "หน้าหลัก",
        dashboard: "แดชบอร์ด",
        add: "เพิ่ม",
        history: "สถิติ",
        settings: "ตั้งค่า",
        close: "ปิด"
      }
    },
    app: {
      sync: {
        syncing: "กำลังซิงค์ข้อมูล...",
        syncFailed: "ไม่สามารถซิงค์ข้อมูลได้",
        syncComplete: "ข้อมูลซิงค์เรียบร้อย"
      }
    }
  },
  ja: {
    title: "AI食品アシスタント",
    subtitle: "GPT-4 Visionで食品を分析し、栄養価を追跡する",
    featureTitle: "自動食品分析",
    featureDescription: "AIが栄養素とカロリーを分析するために食品画像をアップロード",
    featureTags: {
      gpt4Vision: "GPT-4 Vision",
      supportAllFood: "日本料理対応",
      highAccuracy: "高精度"
    },
    upload: {
      title: "食品画像をアップロード",
      dragDrop: "ここにファイルをドラッグ＆ドロップ、またはクリックしてアップロード",
      sizeLimit: "最大画像サイズ：5MB",
      formats: ["JPG", "PNG", "WebP", "HEIC"]
    },
    uploadOptions: {
      gallery: "ギャラリーから選択",
      camera: "食品を撮影"
    },
    addFood: {
      title: "食品を追加",
      subtitle: "簡単に食事を記録",
      customFood: "カスタム食品を追加",
      submitButton: "食品を追加"
    },
    analyze: {
      button: "GPT-4 Visionで分析",
      apiUsage: "分析ごとにOpenAI APIクォータを1回使用",
      highAccuracy: "高精度"
    },
    analyzing: {
      title: "GPT-4 Visionで分析中",
      pleaseWait: "お待ちください...",
      steps: {
        step1: "食品の種類と詳細を識別中",
        step2: "栄養価と主要成分を分析中",
        step3: "カロリーと栄養素を推定中"
      }
    },
    result: {
      nutritionalInfo: "栄養情報",
      per: "あたり",
      totalCalories: "総カロリー",
      protein: "タンパク質",
      carbs: "炭水化物",
      fat: "脂肪",
      analyzedBy: "OpenAI GPT-4 Visionによる分析 | 栄養価は推定値です"
    },
    addMeal: {
      title: "食事を記録",
      subtitle: "この食事から摂取した栄養素を記録",
      mealType: "食事タイプ",
      mealTypes: {
        breakfast: "朝食",
        lunch: "昼食",
        dinner: "夕食",
        snack: "間食"
      },
      quantity: "数量",
      total: "合計",
      saveButton: "食事を保存",
      analyzeAgain: "再分析"
    },
    success: {
      title: "データが正常に保存されました",
      message: "{food}を{quantity}{unit}{mealType}リストに追加しました",
      unit: "単位 | 単位",
      goToDashboard: "ダッシュボードへ",
      takeNewPhoto: "新しい写真を撮る"
    },
    foodCategories: {
      protein: "タンパク質食品",
      vegetable: "野菜",
      fruit: "果物",
      grain: "穀物/でんぷん",
      dairy: "乳製品",
      snack: "スナック",
      beverage: "飲料",
      other: "その他"
    },
    tips: {
      title: "GPT-4 Visionのヒント",
      tip1: "食品全体が見えるように上から写真を撮り、十分な明るさを確保してください",
      tip2: "GPT-4 Visionは日本料理を含む様々な国際料理をより正確に分析できます",
      tip3: "結果が正確でない場合は、再分析できます",
      tip4: "栄養価はAIの推定値であり、実際の値と異なる場合があります"
    },
    techInfo: {
      title: "OpenAI GPT-4 Vision技術",
      description: "このシステムは高度なAIを使用して食品画像を分析し、栄養価を推定します"
    },
    mobileNav: {
      common: {
        back: "戻る",
        search: "検索",
        searchPlaceholder: "データベースで食品を検索...",
        calories: "カロリー",
        per: "あたり",
        noResults: "結果が見つかりません",
        quickActions: "クイックアクション",
        commonFoodsDesc: "よく使われる食品から選択",
        customFoodDesc: "独自の食品エントリを作成",
        barcodeScannerDesc: "バーコードから栄養情報を取得",
        recentFoodsDesc: "最近追加した食品を表示"
      },
      commonFoods: {
        title: "一般的な食品",
        categories: {
          protein: "タンパク質",
          vegetable: "野菜",
          fruit: "果物",
          grain: "穀物",
          dairy: "乳製品",
          snack: "スナック",
          beverage: "飲料",
          other: "その他"
        }
      },
      customFood: {
        title: "カスタム食品",
        addNew: "カスタム食品を追加",
        addNewTitle: "新しいカスタム食品を追加",
        yourCustomFoods: "カスタム食品",
        createFirst: "最初のカスタム食品を作成",
        noCustomFoods: "カスタム食品はまだありません。",
        foodName: "食品名",
        foodNamePlaceholder: "例：ホームメイドスムージー",
        foodCategory: "食品カテゴリー",
        selectCategory: "カテゴリーを選択",
        calories: "カロリー",
        protein: "タンパク質（g）",
        carbs: "炭水化物（g）",
        fat: "脂肪（g）",
        servingSize: "提供サイズ",
        badge: "カスタム",
        caloriesPer: "カロリー/100g"
      },
      recentFoods: {
        title: "最近の食品",
        noFoods: "最近の食品が見つかりません"
      },
      foodDetail: {
        back: "戻る",
        mealType: "食事タイプ",
        mealTypes: {
          breakfast: "朝食",
          lunch: "昼食",
          dinner: "夕食",
          snack: "間食"
        },
        quantity: "数量",
        totalCalories: "総カロリー",
        addToMeal: "食事に追加",
        editFood: "食事を編集",
        save: "保存",
        saveChanges: "変更を保存",
        servingSize: "提供サイズ",
        saveCustomFood: "カスタム食品に追加",
        saveCustomFoodDesc: "この食品を保存して将来のアクセスを容易にする",
        saveButton: "カスタム食品に保存",
        usingCustomFood: "保存したカスタム食品データを使用中",
        warningTitle: "この変更は現在の項目のみに影響します",
        warningDesc: "この編集は、この食品の以前に保存されたエントリやテンプレートには影響しません"
      },
      barcodeScanner: {
        title: "バーコードをスキャン",
        scanInstructions: "食品製品のバーコードをスキャンしてください",
        openCamera: "カメラを開く",
        cancelScan: "キャンセル",
        searching: "検索中...",
        manualInput: "または手動でバーコードを入力:",
        searchButton: "検索",
        testBarcodes: "バーコードを試す: 8851959131012, 8850329112224, 8858891302701",
        errors: {
          invalidBarcode: "無効なバーコードです。もう一度お試しください。",
          notFound: "このバーコードの食品データが見つかりません。",
          cameraPermission: "カメラへのアクセスが拒否されました。ブラウザの設定でカメラへのアクセスを有効にしてください。",
          noCamera: "このデバイスにカメラが見つかりません。カメラ付きのデバイスを使用してください。",
          general: "カメラへのアクセスエラー: "
        }
      },
      aiAssistant: {
        title: "AI食品分析",
        description: "AI分析のために食品画像をアップロード",
        buttonText: "AIで分析"
      },
      navigation: {
        home: "ホーム",
        dashboard: "ダッシュボード",
        add: "追加",
        history: "統計",
        settings: "設定",
        close: "閉じる"
      }
    },
    app: {
      sync: {
        syncing: "データを同期中...",
        syncFailed: "同期に失敗しました",
        syncComplete: "データが正常に同期されました"
      }
    }
  },
  zh: {
    title: "AI食品助手",
    subtitle: "使用GPT-4 Vision分析食物以跟踪营养价值",
    featureTitle: "自动食品分析",
    featureDescription: "上传食物图片，让AI分析营养成分和卡路里",
    featureTags: {
      gpt4Vision: "GPT-4 Vision",
      supportAllFood: "支持中式料理",
      highAccuracy: "高精度"
    },
    upload: {
      title: "上传食物图片",
      dragDrop: "将文件拖放到此处或点击上传",
      sizeLimit: "最大图片大小：5MB",
      formats: ["JPG", "PNG", "WebP", "HEIC"]
    },
    uploadOptions: {
      gallery: "从相册选择",
      camera: "拍摄食物"
    },
    addFood: {
      title: "添加食品",
      subtitle: "轻松记录您的餐食",
      customFood: "添加自定义食品",
      submitButton: "添加食品"
    },
    analyze: {
      button: "使用GPT-4 Vision分析",
      apiUsage: "每次分析使用1个OpenAI API配额",
      highAccuracy: "高精度"
    },
    analyzing: {
      title: "正在使用GPT-4 Vision分析",
      pleaseWait: "请稍候...",
      steps: {
        step1: "识别食物类型和详情",
        step2: "分析营养价值和主要成分",
        step3: "估算卡路里和营养素"
      }
    },
    result: {
      nutritionalInfo: "营养信息",
      per: "每",
      totalCalories: "总卡路里",
      protein: "蛋白质",
      carbs: "碳水化合物",
      fat: "脂肪",
      analyzedBy: "由OpenAI GPT-4 Vision分析 | 营养价值为估计值"
    },
    addMeal: {
      title: "记录餐食",
      subtitle: "记录从这餐获得的营养素",
      mealType: "餐食类型",
      mealTypes: {
        breakfast: "早餐",
        lunch: "午餐",
        dinner: "晚餐",
        snack: "小食"
      },
      quantity: "数量",
      total: "总计",
      saveButton: "保存餐食",
      analyzeAgain: "重新分析"
    },
    success: {
      title: "数据保存成功",
      message: "已添加{quantity}{unit}{food}到{mealType}列表",
      unit: "单位 | 单位",
      goToDashboard: "前往仪表板",
      takeNewPhoto: "拍摄新照片"
    },
    foodCategories: {
      protein: "蛋白质食品",
      vegetable: "蔬菜",
      fruit: "水果",
      grain: "谷物/淀粉",
      dairy: "乳制品",
      snack: "零食",
      beverage: "饮料",
      other: "其他"
    },
    tips: {
      title: "GPT-4 Vision使用技巧",
      tip1: "从上方拍摄食物，确保可以看到整盘/整碗食物，并有充足的光线",
      tip2: "GPT-4 Vision能够更准确地分析中式和国际美食",
      tip3: "如果结果不准确，可以重新分析",
      tip4: "营养价值是AI的估计值，可能有所偏差"
    },
    techInfo: {
      title: "OpenAI GPT-4 Vision技术",
      description: "系统使用先进AI技术分析食物图片并估算营养价值"
    },
    mobileNav: {
      common: {
        back: "返回",
        search: "搜索",
        searchPlaceholder: "在数据库中搜索食品...",
        calories: "卡路里",
        per: "每",
        noResults: "未找到结果",
        quickActions: "快速操作",
        commonFoodsDesc: "从常用食品中选择",
        customFoodDesc: "创建自己的食品条目",
        barcodeScannerDesc: "从条形码获取营养信息",
        recentFoodsDesc: "查看最近添加的食品"
      },
      commonFoods: {
        title: "常见食品",
        categories: {
          protein: "蛋白质",
          vegetable: "蔬菜",
          fruit: "水果",
          grain: "谷物",
          dairy: "乳制品",
          snack: "零食",
          beverage: "饮料",
          other: "其他"
        }
      },
      customFood: {
        title: "自定义食品",
        addNew: "添加自定义食品",
        addNewTitle: "添加新自定义食品",
        yourCustomFoods: "您的自定义食品",
        createFirst: "创建您的第一个自定义食品",
        noCustomFoods: "还没有自定义食品。",
        foodName: "食品名称",
        foodNamePlaceholder: "例如：自制奶昔",
        foodCategory: "食品类别",
        selectCategory: "选择类别",
        calories: "卡路里",
        protein: "蛋白质（g）",
        carbs: "碳水化合物（g）",
        fat: "脂肪（g）",
        servingSize: "份量",
        badge: "自定义",
        caloriesPer: "卡路里/100g"
      },
      recentFoods: {
        title: "最近的食品",
        noFoods: "未找到最近的食品"
      },
      foodDetail: {
        back: "返回",
        mealType: "餐点类型",
        mealTypes: {
          breakfast: "早餐",
          lunch: "午餐",
          dinner: "晚餐",
          snack: "零食"
        },
        quantity: "数量",
        totalCalories: "总卡路里",
        addToMeal: "添加到餐点",
        editFood: "编辑食物",
        save: "保存",
        saveChanges: "保存更改",
        servingSize: "份量",
        saveCustomFood: "添加到我的自定义食品",
        saveCustomFoodDesc: "保存此食品以方便将来访问",
        saveButton: "保存到我的自定义食品",
        usingCustomFood: "正在使用您保存的自定义食品数据",
        warningTitle: "更改仅影响此项目",
        warningDesc: "这些编辑不会影响此食品的先前保存条目或模板"
      },
      barcodeScanner: {
        title: "扫描条形码",
        scanInstructions: "扫描食品上的条形码",
        openCamera: "打开相机",
        cancelScan: "取消",
        searching: "搜索中...",
        manualInput: "或手动输入条形码:",
        searchButton: "搜索",
        testBarcodes: "尝试条形码: 8851959131012, 8850329112224, 8858891302701",
        errors: {
          invalidBarcode: "条形码无效。请重试。",
          notFound: "未找到此条形码的食品数据。",
          cameraPermission: "相机访问被拒绝。请在浏览器设置中启用相机访问。",
          noCamera: "此设备上未找到相机。请使用带有相机的设备。",
          general: "访问相机出错: "
        }
      },
      aiAssistant: {
        title: "AI食品分析",
        description: "上传食品图像进行AI分析",
        buttonText: "用AI分析"
      },
      navigation: {
        home: "首页",
        dashboard: "仪表盘",
        add: "添加",
        history: "统计",
        settings: "设置",
        close: "关闭"
      }
    },
    app: {
      sync: {
        syncing: "正在同步数据...",
        syncFailed: "同步失败",
        syncComplete: "数据同步成功"
      }
    }
  }
}; 