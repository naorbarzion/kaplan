document.addEventListener('DOMContentLoaded', () => {
    const previewButton = document.getElementById('previewButton');
    const clearSignatureButton = document.getElementById('clearSignatureButton');
    const generatePDFButton = document.getElementById('generatePDFButton');
    const editFormButton = document.getElementById('editFormButton');
    const signatureCanvas = document.getElementById('signatureCanvas');

    if (!previewButton || !clearSignatureButton || !generatePDFButton || !editFormButton || !signatureCanvas) {
        console.error("One or more required elements not found in the document.");
        return;
    }

    const signaturePad = new SignaturePad(signatureCanvas);
    let agreementTemplate = '';

    // Load the agreement template
    fetch('agreement_template.txt')
        .then(response => response.text())
        .then(text => {
            agreementTemplate = text;
        })
        .catch(() => {
            console.error("Error loading agreement template.");
            agreementTemplate = "תנאי החוזה לא נטענו בהצלחה. אנא צור קשר עם מנהל המערכת.";
        });

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

    generatePDFButton.addEventListener('click', () => {
        if (signaturePad.isEmpty()) {
            alert("אנא חתום על ההסכם לפני יצירת המסמך.");
            return;
        }
        const element = document.getElementById('preview');
        const opt = {
            margin: 10,
            filename: 'הסכם_השכרת_רכב.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    });

    clearSignatureButton.addEventListener('click', () => signaturePad.clear());

    editFormButton.addEventListener('click', () => toggleDisplay('rentalForm', 'preview'));

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

    function fillPreview(formData, template) {
        document.getElementById('clientDetails').innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <p><strong>תאריך:</strong> ${formData.date}</p>
                <p><strong>שם מלא:</strong> ${formData.name}</p>
                <p><strong>ת.ז:</strong> ${formData.id}</p>
                <p><strong>כתובת:</strong> ${formData.address}</p>
                <p><strong>טלפון:</strong> ${formData.phone}</p>
                <p><strong>סוג רכב:</strong> ${formData.carType}</p>
                <p><strong>קילומטרים בתחילת הנסיעה:</strong> ${formData.startKm}</p>
                <p><strong>שעת יציאה:</strong> ${formData.startTime}</p>
                <p><strong>כמות דלק:</strong> ${formData.fuelAmount}</p>
            </div>
        `;

        // Display the full agreement template
        document.getElementById('agreementText').innerHTML = `<pre class="whitespace-pre-wrap">${template}</pre>`;
    }

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
            img.classList.add('max-w-xs', 'h-auto', 'mb-2', 'rounded', 'shadow');
            const reader = new FileReader();
            reader.onload = (e) => img.src = e.target.result;
            reader.readAsDataURL(file);
            carImagesPreview.appendChild(img);
        });
    }

    function toggleDisplay(showId, hideId) {
        document.getElementById(showId).style.display = 'block';
        document.getElementById(hideId).style.display = 'none';
    }
});
