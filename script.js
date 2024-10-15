let signaturePad;
let agreementTemplate;

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('signatureCanvas');
    signaturePad = new SignaturePad(canvas);

    document.getElementById('previewButton').addEventListener('click', showPreview);
    document.getElementById('clearSignatureButton').addEventListener('click', clearSignature);
    document.getElementById('generateContractButton').addEventListener('click', generateContract);
    document.getElementById('editFormButton').addEventListener('click', editForm);

    // טען את תבנית החוזה
    loadFile('agreement_template.docx', function(error, content) {
        if (error) {
            console.error("שגיאה בטעינת תבנית החוזה:", error);
            alert("אירעה שגיאה בטעינת החוזה. אנא נסה שוב מאוחר יותר.");
        } else {
            agreementTemplate = content;
        }
    });
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

    // מלא את פרטי החוזה
    const filledAgreement = fillAgreementTemplate(agreementTemplate, formData);
    
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

    // הצג את תמונות הרכב
    const carImages = document.getElementById('carImages').files;
    const carImagesPreview = document.getElementById('carImagesPreview');
    carImagesPreview.innerHTML = '';
    for (let i = 0; i < carImages.length; i++) {
        const img = document.createElement('img');
        img.classList.add('image-preview');
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
        }
        reader.readAsDataURL(carImages[i]);
        carImagesPreview.appendChild(img);
    }

    document.getElementById('preview').style.display = 'block';
    document.getElementById('rentalForm').style.display = 'none';
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

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // הוסף את תוכן החוזה
    const content = document.getElementById('previewContent').textContent;
    doc.text(content, 10, 10);

    // הוסף את תמונת רישיון הנהיגה
    const licenseImage = document.getElementById('licensePreview');
    doc.addImage(licenseImage, 'JPEG', 10, 100, 50, 30);

    // הוסף את תמונות הרכב
    const carImages = document.querySelectorAll('#carImagesPreview img');
    let yPosition = 140;
    carImages.forEach((img, index) => {
        doc.addImage(img, 'JPEG', 10, yPosition, 30, 20);
        yPosition += 30;
    });

    // הוסף את החתימה
    const signatureImage = signaturePad.toDataURL();
    doc.addImage(signatureImage, 'PNG', 10, yPosition, 50, 20);

    // שמור את הקובץ
    doc.save('חוזה_השכרת_רכב.pdf');
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
