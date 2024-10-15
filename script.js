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
    // בדוק אם האלמנט שבו מוצגים פרטי הלקוח קיים
    const clientDetailsElement = document.getElementById('clientDetails');
    if (!clientDetailsElement) {
        alert('שגיאה: האלמנט להצגת פרטי הלקוח לא נמצא!');
        return;
    }

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

    // הצגת פרטי הלקוח בתצוגה בשלב השני
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
        alert("Please sign the contract before generating the document.");
        return;
    }

    // איסוף פרטי החוזה והחתימה
    const content = document.getElementById('previewContent').textContent;
    const signatureImage = signaturePad.toDataURL();

    // אפשרות 1: שמירת המסמך בפורמט Word
    const docContent = `
    <h2>הסכם השכרה</h2>
    <p>${content}</p>
    <h3>חתימת הלקוח:</h3>
    <img src="${signatureImage}" width="200" height="50" />
    `;

    const wordBlob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
    const wordUrl = URL.createObjectURL(wordBlob);
    const wordLink = document.createElement('a');
    wordLink.href = wordUrl;
    wordLink.download = 'Rental_Agreement.docx';
    document.body.appendChild(wordLink);
    wordLink.click();
    document.body.removeChild(wordLink);

    // אפשרות 2: שמירת המסמך בפורמט TXT
    const txtContent = `
הסכם השכרה:
${content}

חתימת הלקוח:
[חתימה מצורפת בקובץ נפרד]
    `;

    const txtBlob = new Blob([txtContent], { type: 'text/plain' });
    const txtUrl = URL.createObjectURL(txtBlob);
    const txtLink = document.createElement('a');
    txtLink.href = txtUrl;
    txtLink.download = 'Rental_Agreement.txt';
    document.body.appendChild(txtLink);
    txtLink.click();
    document.body.removeChild(txtLink);

    // אפשרות 3: שמירת המסמך בפורמט PDF עם גופן עברי
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

    // הוספת חתימה ל-PDF
    if (signatureImage) {
        pdfDoc.addImage(signatureImage, 'PNG', 10, 50, 50, 20);
    }

    // שמירת ה-PDF
    pdfDoc.save('Rental_Agreement_Hebrew.pdf');
}
