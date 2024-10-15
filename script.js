// טיפול בשגיאות גלובלי
window.onerror = function(message, source, lineno, colno, error) {
    console.error("שגיאה: " + message + " בשורה " + lineno + " במקור " + source);
    alert("אירעה שגיאה. אנא בדוק את קונסול הדפדפן לפרטים נוספים.");
};

function loadDocxTemplate(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function (e) {
        if (xhr.status === 200) {
            callback(null, xhr.response);
        } else {
            callback(new Error("נכשלה טעינת תבנית ה-DOCX. קוד סטטוס: " + xhr.status), null);
        }
    };
    xhr.onerror = function() {
        callback(new Error("אירעה שגיאת רשת בעת ניסיון לטעון את הקובץ"), null);
    };
    xhr.send();
}

function generateContract() {
    const name = document.getElementById('name').value;
    const id = document.getElementById('id').value;
    const carType = document.getElementById('carType').value;
    const startKm = document.getElementById('startKm').value;

    if (!name || !id || !carType || !startKm) {
        alert("אנא מלא את כל השדות הנדרשים");
        return;
    }

    loadDocxTemplate('rental1.docx', function (error, content) {
        if (error) {
            console.error("שגיאה בטעינת התבנית:", error);
            alert("אירעה שגיאה בטעינת התבנית. אנא נסה שוב מאוחר יותר.");
            return;
        }

        try {
            var zip = new PizZip(content);
            var doc = new window.docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            doc.setData({
                name: name,
                id: id,
                carType: carType,
                startKm: startKm,
            });

            doc.render();

            var out = doc.getZip().generate({
                type: 'blob',
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });

            saveAs(out, 'filled_contract.docx');
        } catch (error) {
            console.error("שגיאה ביצירת המסמך:", error);
            alert("אירעה שגיאה ביצירת המסמך. אנא נסה שוב.");
        }
    });
}
