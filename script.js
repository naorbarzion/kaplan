let signaturePad;

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('signatureCanvas');
    signaturePad = new SignaturePad(canvas);

    document.getElementById('previewButton').addEventListener('click', showPreview);
    document.getElementById('clearSignatureButton').addEventListener('click', clearSignature);
    document.getElementById('generateContractButton').addEventListener('click', generateContract);
    document.getElementById('editFormButton').addEventListener('click', editForm);
});

function showPreview() {
    const formData = {
        date: document.getElementById('date').value,
        name: document.getElementById('name').value,
        id: document.getElementById('id').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        carType: document.getElementById('carType').value,
        startKm: document.getElementById('startKm').value,
        startTime: document.getElementById('startTime').value,
        fuelAmount: document.getElementById('fuelAmount').value
    };

    if (Object.values(formData).some(value => !value)) {
        alert("אנא מלא את כל השדות הנדרשים");
        return;
    }

    // טען את תבנית החוזה
    loadFile('agreement_template.docx', function(error, content) {
        if (error) {
            console.error("שגיאה בטעינת תבנית החוזה:", error);
            alert("אירעה שגיאה בטעינת החוזה. אנא נסה שוב מאוחר יותר.");
            return;
        }

        // מלא את פרטי החוזה
        const filledAgreement = fillAgreementTemplate(content, formData);
        
        // הצג את החוזה המלא
        document.getElementById('previewContent').textContent = filledAgreement;
        
        // הצג את תמונת הרישיון
        const licenseImage = document.getElementById('licenseImage').files[0];
        if (licenseImage) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('licensePreview').src = e.target.result;
            }
            reader.readAsDataURL(licenseImage);
        }

        document.getElementById('preview').style.display = 'block';
        document.getElementById('rentalForm').style.display = 'none';
    });
}

function fillAgreementTemplate(template, data) {
    // כאן תהיה הלוגיקה למילוי התבנית עם הנתונים
    // לצורך הדוגמה, נחזיר פשוט את הנתונים כטקסט
    return `חוזה השכרת רכב:
    תאריך: ${data.date}
    שם: ${data.name}
    ת.ז: ${data.id}
    כתובת: ${data.address}
    טלפון: ${data.phone}
    סוג רכב: ${data.carType}
    קילומטראז' התחלתי: ${data.startKm}
    שעת יציאה: ${data.startTime}
    כמות דלק: ${data.fuelAmount}
    
    // כאן יבוא תוכן החוזה המלא
    `;
}

function clearSignature() {
    if (signaturePad) {
        signaturePad.clear();
    }
}

function editForm() {
    document.getElementById('preview').style.display = 'none';
    document.getElementById('rentalForm').style.display = 'block';
}

function generateContract() {
    if (!signaturePad || signaturePad.isEmpty()) {
        alert("אנא חתום על החוזה לפני היצירה");
        return;
    }

    // כאן תהיה הלוגיקה ליצירת קובץ DOCX סופי עם החתימה
    // לצורך הדוגמה, נשמור רק את החתימה כתמונה
    const signatureImage = signaturePad.toDataURL();
    
    // שמירת החתימה כתמונה (לדוגמה בלבד)
    const link = document.createElement('a');
    link.href = signatureImage;
    link.download = 'signature.png';
    link.click();

    alert("החוזה נוצר בהצלחה!");
}

function loadFile(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
        if (xhr.status === 200) {
            callback(null, xhr.response);
        } else {
            callback(new Error("Failed to load file"), null);
        }
    };
    xhr.send();
}

console.log("script.js נטען בהצלחה");
