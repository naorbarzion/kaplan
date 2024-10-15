let signaturePad;
let agreementTemplate = '';

document.addEventListener('DOMContentLoaded', function () {
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
    // אסוף את הנתונים מהטופס
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

    // Validate that all fields are filled
    if (Object.values(formData).some(value => !value)) {
        alert("Please fill out all the required fields.");
        return;
    }

    // מלא את תבנית החוזה בנתונים מהטופס
    let filledAgreement = agreementTemplate;
    for (const [key, value] of Object.entries(formData)) {
        const regex = new RegExp(`{${key}}`, 'g');
        filledAgreement = filledAgreement.replace(regex, value);
    }

    // הצגת התוכן המעודכן בתצוגה מקדימה
    document.getElementById('previewContent').textContent = filledAgreement;

    // הצגת תמונת רישיון נהיגה
    const licenseImage = document.getElementById('licenseImage').files[0];
    if (licenseImage) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('licensePreview').src = e.target.result;
        }
        reader.readAsDataURL(licenseImage);
    }

    // הצגת תמונות הרכב
    const carImages = document.getElementById('carImages').files;
    const carImagesPreview = document.getElementById('carImagesPreview');
    carImagesPreview.innerHTML = ''; // נקה תמונות קודמות
    for (let i = 0; i < carImages.length; i++) {
        const img = document.createElement('img');
        img.classList.add('image-preview');
        const reader = new FileReader();
        reader.onload = function (e) {
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
        alert("Please sign the contract before generating the PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // הגדרת גופן מתאים לעברית
    doc.addFileToVFS('Arial.ttf', arialFont); // יש להוסיף גופן תומך עברית
    doc.addFont('Arial.ttf', 'Arial', 'normal');
    doc.setFont('Arial');

    // הוספת תוכן ההסכם ל-PDF
    const content = document.getElementById('previewContent').textContent;
    doc.setFontSize(12);
    doc.text(content, 10, 10, { maxWidth: 190, align: "right" });

    // הוספת תמונת רישיון נהיגה
    const licenseImage = document.getElementById('licensePreview');
    if (licenseImage.src) {
        doc.addImage(licenseImage.src, 'JPEG', 10, 50, 50, 30);
    }

    // הוספת תמונות רכב
    const carImages = document.querySelectorAll('#carImagesPreview img');
    let yPosition = 90;
    carImages.forEach((img) => {
        doc.addImage(img.src, 'JPEG', 10, yPosition, 30, 20);
        yPosition += 30;
    });

    // הוספת חתימה ל-PDF
    const signatureImage = signaturePad.toDataURL();
    if (signatureImage) {
        yPosition += 10;
        doc.addImage(signatureImage, 'PNG', 10, yPosition, 50, 20);
    }

    // שמירת ה-PDF
    doc.save('Rental_Agreement.pdf');
}
