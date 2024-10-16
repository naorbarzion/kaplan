document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('rentalForm');

    // שליחת הטופס
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // שמירת הנתונים ב-LocalStorage כדי להעבירם לשלב ב'
        const formData = new FormData(form);
        localStorage.setItem('rentalData', JSON.stringify({
            date: formData.get('date'),
            carType: formData.get('carType'),
            kmOut: formData.get('kmOut'),
            timeOut: formData.get('timeOut'),
            name: formData.get('name'),
            id: formData.get('id'),
            address: formData.get('address'),
            fuel: formData.get('fuel'),
            phone: formData.get('phone'),
            carImages: formData.getAll('carImages').map(file => URL.createObjectURL(file)),
            licenseImage: URL.createObjectURL(formData.get('licenseImage'))
        }));

        // מעבר לשלב ב'
        window.location.href = 'agreement.html';
    });
});
