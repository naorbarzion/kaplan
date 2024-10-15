document.addEventListener('DOMContentLoaded', () => {
    const previewButton = document.getElementById('previewButton');
    const clearSignatureButton = document.getElementById('clearSignatureButton');
    const generatePDFButton = document.getElementById('generatePDFButton');
    const editFormButton = document.getElementById('editFormButton');

    // בדוק שכל האלמנטים קיימים לפני ההפעלה
    if (!previewButton || !generatePDFButton || !editFormButton) {
        console.error("Element(s) not found in the document.");
        return;
    }

    const signaturePad = new SignaturePad(document.getElementById('signatureCanvas'));
    let agreementTemplate = '';

    // טעינת תבנית ההסכם
    fetch('agreement_template.txt')
        .then(response => response.text())
        .then(text => agreementTemplate = text)
        .catch(() => alert("Error loading agreement template."));

    // פונקציה להצגת תצוגה מקדימה
    previewButton.addEventListener('click', () => {
        const formData = getFormData();
        if (!isFormValid(formData)) {
            alert("אנא מלא את כל השדות הנדרשים.");
            return;
        }
        fillPreview(formData, agreementTemplate);
        handleImagesPreview();
        toggleDisplay('preview', 'rentalForm');
    });

    // פונקציה ליצירת PDF
    generatePDFButton.addEventListener('click', () => {
        if (signaturePad.isEmpty()) {
            alert("אנא חתום על ההסכם לפני יצירת המסמך.");
            return;
        }
        const element = document.getElementById('preview');
        html2pdf().from(element).save('Rental_Agreement.pdf');
    });

    // פונקציה לניקוי חתימה
    clearSignatureButton?.addEventListener('click', () => signaturePad.clear());

    // עריכת הטופס מחדש
    editFormButton.addEventListener('click', () => toggleDisplay('rentalForm', 'preview'));

    // פונקציות עזר
    function getFormData() {
        return {
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
    }

    function isFormValid(formData) {
        return Object.values(formData).every(value => value);
    }

    // ממלא את פרטי הלקוח בתצוגה מקדימה
    function fillPreview(formData, template) {
        let filledAgreement = template;
        Object.entries(formData).forEach(([key, value]) => {
            filledAgreement = filledAgreement.replace(new RegExp(`{${key}}`, 'g'), value);
        });

        document.getElementById('clientDetails').innerHTML = `
            <p>תאריך: ${formData.date}</p>
            <p>שם מלא: ${formData.name}</p>
            <p>ת.ז: ${formData.id}</p>
            <p>כתובת: ${formData.address}</p>
            <p>טלפון: ${formData.phone}</p>
            <p>סוג רכב: ${formData.carType}</p>
            <p>קילומטרים בתחילת הנסיעה: ${formData.startKm}</p>
            <p>שעת יציאה: ${formData.startTime}</p>
            <p>כמות דלק: ${formData.fuelAmount}</p>
        `;
    }

    // הצגת תמונות רישיון נהיגה ותמונות הרכב בתצוגה מקדימה
    function handleImagesPreview() {
        const licenseImage = document.getElementById('licenseImage').files[0];
        const licensePreview = document.getElementById('licensePreview');
        if (licenseImage) {
            const reader = new FileReader();
            reader.onload = (e) => licensePreview.src = e.target.result;
            reader.readAsDataURL(licenseImage);
        }

        const carImages = document.getElementById('carImages').files;
        const carImagesPreview = document.getElementById('carImagesPreview');
        carImagesPreview.innerHTML = '';
        Array.from(carImages).forEach((file) => {
            const img = document.createElement('img');
            img.classList.add('image-preview');
            const reader = new FileReader();
            reader.onload = (e) => img.src = e.target.result;
            reader.readAsDataURL(file);
            carImagesPreview.appendChild(img);
        });
    }

    // פונקציה להחלפת התצוגה בין הטופס לתצוגה מקדימה
    function toggleDisplay(showId, hideId) {
        document.getElementById(showId).style.display = 'block';
        document.getElementById(hideId).style.display = 'none';
    }
});
