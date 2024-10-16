document.addEventListener('DOMContentLoaded', function () {
    const signaturePad = document.getElementById('signaturePad');
    const context = signaturePad.getContext('2d');
    const agreementDetails = document.getElementById('agreementDetails');

    // טען נתוני השוכר
    const rentalData = JSON.parse(localStorage.getItem('rentalData'));

    // הצגת פרטי ההסכם
    let agreementHTML = `
        <p>תאריך: ${rentalData.date}</p>
        <p>סוג רכב: ${rentalData.carType}</p>
        <p>קילומטר ביציאה: ${rentalData.kmOut}</p>
        <p>שעת יציאה: ${rentalData.timeOut}</p>
        <p>שם השוכר: ${rentalData.name}</p>
        <p>תעודת זהות: ${rentalData.id}</p>
        <p>כתובת: ${rentalData.address}</p>
        <p>כמות דלק: ${rentalData.fuel}</p>
        <p>טלפון: ${rentalData.phone}</p>
        <p><strong>תמונות רכב ביציאה:</strong></p>`;
    
    rentalData.carImages.forEach((image, index) => {
        agreementHTML += `<img src="${image}" alt="תמונת רכב ${index + 1}" style="max-width: 200px; margin-right: 10px;"/>`;
    });

    agreementHTML += `<p><strong>תמונת רישיון נהיגה:</strong></p><img src="${rentalData.licenseImage}" alt="רישיון נהיגה" style="max-width: 200px;"/>`;

    agreementDetails.innerHTML = agreementHTML;

    // ניקוי חתימה
    window.clearSignature = function () {
        context.clearRect(0, 0, signaturePad.width, signaturePad.height);
    };

    // טיפול בחתימה ובשליחה
    document.getElementById('submitAgreement').addEventListener('click', function () {
        const signatureData = signaturePad.toDataURL();
        alert('ההסכם נחתם בהצלחה!');
        console.log('פרטי ההסכם:', rentalData, 'חתימה:', signatureData);
    });
});
