let signaturePad;
let agreementTemplate = '';

document.addEventListener('DOMContentLoaded', function() {
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
    // Collect the form data
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

    // Fill the agreement template with form data
    let filledAgreement = agreementTemplate;
    for (const [key, value] of Object.entries(formData)) {
        filledAgreement = filledAgreement.replace(`{${key}}`, value);
    }

    // Display the agreement content in the preview section
    document.getElementById('previewContent').textContent = filledAgreement;

    // Show driver's license image preview
    const licenseImage = document.getElementById('licenseImage').files[0];
    if (licenseImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('licensePreview').src = e.target.result;
        }
        reader.readAsDataURL(licenseImage);
    }

    // Show car images in the preview
    const carImages = document.getElementById('carImages').files;
    const carImagesPreview = document.getElementById('carImagesPreview');
    carImagesPreview.innerHTML = ''; // Clear previous previews
    for (let i = 0; i < carImages.length; i++) {
        const img = document.createElement('img');
        img.classList.add('image-preview');
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
        }
        reader.readAsDataURL(carImages[i]);
        carImagesPreview.appendChild(img);
    }

    // Show the preview and hide the form
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

    // Add the filled agreement text to the PDF
    const content = document.getElementById('previewContent').textContent;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    let yPosition = 10; // Starting y-position for the text
    doc.text(content, 10, yPosition, { maxWidth: 190, align: "right" });

    // Add driver's license image to the PDF
    const licenseImage = document.getElementById('licensePreview');
    if (licenseImage.src) {
        yPosition += 10; // Add some space after the text
        doc.addImage(licenseImage.src, 'JPEG', 10, yPosition, 50, 30);
        yPosition += 40; // Adjust y-position after the image
    }

    // Add car images to the PDF
    const carImages = document.querySelectorAll('#carImagesPreview img');
    carImages.forEach((img) => {
        doc.addImage(img.src, 'JPEG', 10, yPosition, 30, 20);
        yPosition += 30; // Adjust y-position after each image
    });

    // Add the signature to the PDF
    const signatureImage = signaturePad.toDataURL();
    if (signatureImage) {
        yPosition += 10; // Add space for the signature
        doc.addImage(signatureImage, 'PNG', 10, yPosition, 50, 20);
    }

    // Save the PDF
    doc.save('Rental_Agreement.pdf');
}
