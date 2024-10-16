document.addEventListener('DOMContentLoaded', function () {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const form = document.getElementById('rentalForm');
    const signaturePad = document.getElementById('signaturePad');
    const context = signaturePad.getContext('2d');
    const agreementDetails = document.getElementById('agreementDetails');
    const contractContent = document.getElementById('contractContent');

    // טעינת קובץ ההסכם מ-agreement-template.html
    function loadAgreementTemplate() {
        fetch('agreement-template.html')
            .then(response => response.text())
            .then(data => {
                contractContent.innerHTML = data;
            })
            .catch(error => {
                contractContent.innerHTML = '<p>שגיאה בטעינת ההסכם.</p>';
                console.error('Error loading agreement template:', error);
            });
    }

    // שליחת הטופס והמעבר לשלב ב'
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // איסוף נתונים מהטופס
        const formData = new FormData(form);
        const rentalData = {
            date: formData.get('date'),
            carType: formData.get('carType'),
            kmOut: formData.get('kmOut'),
            timeOut: formData.get('timeOut'),
            name: formData.get('name'),
            id: formData.get('id'),
            address: formData.get('address'),
            fuel: formData.get('fuel'),
            phone: formData.get('phone'),
            carImages: Array.from(formData.getAll('carImages')).map(file => URL.createObjectURL(file)),
            licenseImage: URL.createObjectURL(formData.get('licenseImage'))
        };

        // הצגת פרטי ההסכם בשלב ב'
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

        // טעינת ההסכם מ-agreement-template.html
        loadAgreementTemplate();

        // מעבר לשלב ב'
        step1.style.display = 'none';
        step2.style.display = 'block';
    });

    // ניקוי חתימה
    window.clearSignature = function () {
        context.clearRect(0, 0, signaturePad.width, signaturePad.height);
    };

    // אישור ההסכם
    document.getElementById('submitAgreement').addEventListener('click', function () {
        const signatureData = signaturePad.toDataURL();
        alert('ההסכם נחתם בהצלחה!');
        console.log('חתימה:', signatureData);
    });
});
