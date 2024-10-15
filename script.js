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

    // הצגת פרטי הלקוח בתצוגה בשלב השני
    document.getElementById('clientDetails').innerHTML = `
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

    // Collect the agreement content and user details
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
    const url = URL.createObjectURL(wordBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Rental_Agreement.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

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
}
