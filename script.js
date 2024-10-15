function loadDocxTemplate(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function (e) {
        if (xhr.status === 200) {
            var arrayBuffer = xhr.response;
            callback(null, arrayBuffer);
        } else {
            callback(new Error("Failed to load DOCX template"), null);
        }
    };
    xhr.send();
}

function generateContract() {
    const name = document.getElementById('name').value;
    const id = document.getElementById('id').value;
    const carType = document.getElementById('carType').value;
    const startKm = document.getElementById('startKm').value;

    loadDocxTemplate('https://raw.githubusercontent.com/naorbarzion/kaplan/main/rental1.docx', function (error, content) {
        if (error) {
            alert("Error loading the template");
            return;
        }

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

        try {
            doc.render();
        } catch (error) {
            console.log(error);
            throw error;
        }

        var out = doc.getZip().generate({
            type: 'blob',
            mimeType:
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        saveAs(out, 'filled_contract.docx');
    });
}

function downloadContract() {
    generateContract();
}
