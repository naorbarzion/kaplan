// ראשית, יש להוסיף גופן עברי תקין שהומר ל-Base64
const hebrewFont = 'AAEAAAAQAIAAAw...'; // כאן יש להכניס את קוד ה-Base64 הנכון לאחר המרה

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
    const clientDetailsElement = document.getElementById('clientDetails');
    if (!clientDetailsElement) {
        alert('שגיאה: האלמנט להצגת פרטי הלקוח לא נמצא!');
        return;
    }

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
        alert("Please fill out all the required fields.");
        return;
    }

    let filledAgreement = agreementTemplate;
    for (const [key, value] of Object.entries(formData)) {
        const regex = new RegExp(`{${key}}`, 'g');
        filledAgreement = filledAgreement.replace(regex, value);
    }

    document.getElementById('previewContent').textContent = filledAgreement;

    clientDetailsElement.innerHTML = `
        <h3>פרטי הלקוח</h3>
        <p>תאריך: ${formData.date}</p>
        <p>שם: ${formData.name}</p>
        <p>ת.ז: ${formData.id}</p>
        <p>כתובת: ${formData.address}</p>
        <p>טלפון: ${formData.phone}</p>
        <p>סוג רכב: ${formData.carType}</p>
        <p>קילומטרים בתחילת הנסיעה: ${formData.startKm}</p>
        <p>שעת התחלה: ${formData.startTime}</p>
        <p>כמות דלק: ${formData.fuelAmount}</p>
    `;

    const licenseImage = document.getElementById('licenseImage').files[0];
    if (licenseImage) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('licensePreview').src = e.target.result;
        }
        reader.readAsDataURL(licenseImage);
    }

    const carImages = document.getElementById('carImages').files;
    const carImagesPreview = document.getElementById('carImagesPreview');
    carImagesPreview.innerHTML = ''; 
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

    document.getElementById('preview').style.display = 'block';
    document.getElementById('rentalForm').style.display = 'none';
}

function generateContract() {
    if (!signaturePad || signaturePad.isEmpty()) {
        alert("Please sign the contract before generating the document.");
        return;
    }

    const content = document.getElementById('previewContent').textContent;
    const signatureImage = signaturePad.toDataURL();

    const { jsPDF } = window.jspdf;
    const pdfDoc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        compress: true
    });

    // הוספת הגופן העברי למסמך
    pdfDoc.addFileToVFS('David-normal.ttf', hebrewFont);
    pdfDoc.addFont('David-normal.ttf', 'David', 'normal');
    pdfDoc.setFont('David', 'normal');

    // הגדרת כיווניות הטקסט לימין לשמאל
    pdfDoc.setR2L(true);

    // הוספת התוכן עם יישור לימין
    pdfDoc.text(content, 180, 10, { align: 'right' });

    if (signatureImage) {
        pdfDoc.addImage(signatureImage, 'PNG', 10, 50, 50, 20);
    }

    pdfDoc.save('Rental_Agreement_Hebrew.pdf');
}
