let signaturePad;
let agreementTemplate = '';

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('signatureCanvas');
    signaturePad = new SignaturePad(canvas);

    document.getElementById('previewButton').addEventListener('click', showPreview);
    document.getElementById('clearSignatureButton').addEventListener('click', clearSignature);
    document.getElementById('generateContractButton').addEventListener('click', generateContract);
    document.getElementById('editFormButton').addEventListener('click', editForm);

    // טען את תבנית החוזה
    fetch('agreement_template.txt')
        .then(response => response.text())
        .then(text => {
            agreementTemplate = text;
        })
        .catch(error => {
            alert("Error loading agreement template.");
        });
});

function showPreview() {
    // איסוף נתוני הטופס
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

    // וידוא שכל השדות מלאים
    if (Object.values(formData).some(value => !value)) {
        alert("אנא מלא את כל השדות הנדרשים.");
        return;
    }

    // מילוי תבנית ההסכם עם נתוני הטופס
    let filledAgreement = agreementTemplate;
    for (const [key, value] of Object.entries(formData)) {
        filledAgreement = filledAgreement.replace(`{${key}}`, value);
    }

    // הצגת תוכן ההסכם בתצוגה מקדימה
    document.getElementById('previewContent').textContent = filledAgreement;

    // הצגת תמונת רישיון נהיגה
    const licenseImage = document.getElementById('licenseImage').files[0];
    if (licenseImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('licensePreview').src = e.target.result;
        }
        reader.readAsDataURL(licenseImage);
    }

    // הצגת תמונות הרכב
    const carImages = document.getElementById('carImages').files;
    const carImagesPreview = document.getElementById('carImagesPreview');
    carImagesPreview.innerHTML = ''; // ניקוי תצוגה קודמת
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

    // הצגת התצוגה המקדימה והסתרת הטופס
    document.getElementById('preview').style.display = 'block';
    document.getElementById('rentalForm').style.display = 'none';
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
        alert("אנא חתום על החוזה לפני יצירת ה-PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // הוספת טקסט ההסכם ל-PDF
    const content = document.getElementById('previewContent').textContent;

    // הוספת הפונט בעברית (צריך לטעון אותו קודם מהשרת או להוסיף את ה-Base64 שלו)
    doc.addFileToVFS("David-Regular.ttf", /* Base64 של הפונט כאן */);
    doc.addFont("David-Regular.ttf", "David", "normal");
    doc.setFont("David", "normal");
    
    doc.setFontSize(14);
    let yPosition = 10; // מיקום y ההתחלתי של הטקסט
    doc.text(content, 10, yPosition, { maxWidth: 190, align: "right" });

    // הוספת תמונת רישיון נהיגה
    const licenseImage = document.getElementById('licensePreview');
    if (licenseImage.src) {
        yPosition += 10; // הוספת מרווח לאחר הטקסט
        doc.addImage(licenseImage.src, 'JPEG', 10, yPosition, 50, 30);
        yPosition += 40; // התאמת המיקום לאחר התמונה
    }

    // הוספת תמונות הרכב
    const carImages = document.querySelectorAll('#carImagesPreview img');
    carImages.forEach((img) => {
        doc.addImage(img.src, 'JPEG', 10, yPosition, 30, 20);
        yPosition += 30; // התאמת המיקום לאחר כל תמונה
    });

    // הוספת החתימה
    const signatureImage = signaturePad.toDataURL();
    if (signatureImage) {
        yPosition += 10; // הוספת מרווח לחתימה
        doc.addImage(signatureImage, 'PNG', 10, yPosition, 50, 20);
    }

    // שמירת ה-PDF
    doc.save('חוזה_השכרת_רכב.pdf');
}
