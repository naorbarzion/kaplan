document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('signatureCanvas');
    const signaturePad = new SignaturePad(canvas);
    let agreementTemplate = '';

    // טוען את תבנית ההסכם מהקובץ
    fetch('agreement_template.txt')
        .then(response => response.text())
        .then(text => agreementTemplate = text)
        .catch(() => alert("Error loading agreement template."));

    // אוספת נתוני טופס והצגת התצוגה המקדימה
    const showPreview = () => {
        const formData = getFormData();
        if (!isFormValid(formData)) {
            alert("Please fill out all the required fields.");
            return;
        }

        populateAgreement(formData);
        handleImagesPreview();
        toggleDisplay('preview', 'rentalForm');
    };

    // מחזירה את הנתונים מהטופס כ-object
    const getFormData = () => ({
        date: document.getElementById('date').value,
        name: document.getElementById('name').value,
        id: document.getElementById('id').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        carType: document.getElementById('carType').value,
        startKm: document.getElementById('startKm').value,
        startTime: document.getElementById('startTime').value,
        fuelAmount: document.getElementById('fuelAmount').value
    });

    // מוודאת שכל השדות מלאים
    const isFormValid = (formData) => Object.values(formData).every(value => value);

    // ממלאת את תבנית ההסכם עם הנתונים מהטופס
    const populateAgreement = (formData) => {
        let filledAgreement = agreementTemplate;
        Object.entries(formData).forEach(([key, value]) => {
            filledAgreement = filledAgreement.replace(new RegExp(`{${key}}`, 'g'), value);
        });

        document.getElementById('clientDetails').innerHTML = `
            <h3>פרטי הלקוח</h3>
            ${Object.entries(formData).map(([key, value]) => `<p>${key}: ${value}</p>`).join('')}
        `;
    };

    // מטפלת בהצגת תמונות רישיון ותמונות הרכב
    const handleImagesPreview = () => {
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
    };

    // מראה את התצוגה המקדימה ומסתירה את הטופס
    const toggleDisplay = (showId, hideId) => {
        document.getElementById(showId).style.display = 'block';
        document.getElementById(hideId).style.display = 'none';
    };

    // פונקציה לניקוי החתימה
    const clearSignature = () => signaturePad.clear();

    // מחזירה את הטופס לעריכה
    const editForm = () => toggleDisplay('rentalForm', 'preview');

    // יצירת קובץ ה-PDF עם התצוגה המקדימה
    const generateContract = () => {
        if (signaturePad.isEmpty()) {
            alert("Please sign the contract before generating the document.");
            return;
        }
        const element = document.getElementById('preview');
        html2pdf().from(element).save('Rental_Agreement.pdf');
    };

    // חיבור אירועים לכפתורים
    document.getElementById('previewButton').addEventListener('click', showPreview);
    document.getElementById('clearSignatureButton').addEventListener('click', clearSignature);
    document.getElementById('generatePDFButton').addEventListener('click', generateContract);
    document.getElementById('editFormButton').addEventListener('click', editForm);
});
