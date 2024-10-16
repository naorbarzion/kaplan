document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('rentalForm');
    const signaturePad = document.getElementById('signaturePad');
    const context = signaturePad.getContext('2d');
    const agreementPreview = document.getElementById('agreementPreview');
    const agreementContent = document.getElementById('agreementContent');

    // טיפול בשליחת הטופס
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // איסוף נתונים מהטופס
        const name = document.getElementById('name').value;
        const id = document.getElementById('id').value;
        const carType = document.getElementById('carType').value;
        const kmOut = document.getElementById('kmOut').value;
        const kmReturn = document.getElementById('kmReturn').value;
        const insurancePlan = document.getElementById('insurancePlan').value;
        const signatureData = signaturePad.toDataURL();

        // טיפול בתמונות (לא נשמור בקבצים, רק נציג ב-HTML)
        const carImages = document.getElementById('carImages').files;
        const licenseImage = document.getElementById('licenseImage').files[0];

        // יצירת תצוגה של ההסכם
        let agreementHTML = `
            <p>שם השוכר: ${name}</p>
            <p>תעודת זהות: ${id}</p>
            <p>סוג רכב: ${carType}</p>
            <p>קילומטר ביציאה: ${kmOut}</p>
            <p>קילומטר בהחזרה: ${kmReturn}</p>
            <p>מסלול ביטוח: ${getInsurancePlanText(insurancePlan)}</p>
            <p><strong>חתימת השוכר:</strong></p>
            <img src="${signatureData}" alt="חתימה" style="border: 1px solid black;"/>
        `;

        // הצגת תמונות רכב
        agreementHTML += '<p><strong>תמונות רכב:</strong></p>';
        Array.from(carImages).forEach((file, index) => {
            const imageURL = URL.createObjectURL(file);
            agreementHTML += `<img src="${imageURL}" alt="תמונת רכב ${index + 1}" style="max-width: 200px; margin-right: 10px;"/>`;
        });

        // הצגת תמונת רישיון
        const licenseURL = URL.createObjectURL(licenseImage);
        agreementHTML += `<p><strong>תמונת רישיון נהיגה:</strong></p><img src="${licenseURL}" alt="רישיון נהיגה" style="max-width: 200px;"/>`;

        // הצגת ההסכם
        agreementContent.innerHTML = agreementHTML;
        agreementPreview.style.display = 'block';
    });

    // פונקציה לניקוי החתימה
    window.clearSignature = function () {
        context.clearRect(0, 0, signaturePad.width, signaturePad.height);
    };

    // עוזר לתרגום מסלול הביטוח לטקסט
    function getInsurancePlanText(plan) {
        switch (plan) {
            case 'partialA': return 'מסלול ביטוח חלקי א\'';
            case 'partialB': return 'מסלול ביטוח חלקי ב\'';
            case 'full': return 'מסלול ביטוח מלא';
            default: return '';
        }
    }
});
