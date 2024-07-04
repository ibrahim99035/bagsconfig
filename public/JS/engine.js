document.getElementById('configForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    const data = {
        fabric: {
            weight_per_sqm: parseFloat(formData.get('fabric.weight_per_sqm')),
            cost_per_gram: parseFloat(formData.get('fabric.cost_per_gram')),
            selling_price_per_gram: parseFloat(formData.get('fabric.selling_price_per_gram')),
        },
        coloring: {
            price: parseFloat(formData.get('coloring.price')),
        },
        printing: {
            methods: {
                none: parseFloat(formData.get('printing.methods.none')),
                '1 sided': parseFloat(formData.get('printing.methods.1_sided')),
                '2 sided': parseFloat(formData.get('printing.methods.2_sided')),
            }
        },
        hand_attachments: {
            none: parseFloat(formData.get('hand_attachments.none')),
            pockets: parseFloat(formData.get('hand_attachments.pockets')),
            zippers: parseFloat(formData.get('hand_attachments.zippers')),
            embroidery: parseFloat(formData.get('hand_attachments.embroidery')),
        },
        tax: parseFloat(formData.get('tax')),
    };

    const response = await fetch('/update-config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.success) {
        alert('Configuration updated successfully!');
    } else {
        alert('Error updating configuration');
    }
});

async function fetchConfig() {
    const response = await fetch('/get-config');
    const config = await response.json();

    document.getElementById('weight_per_sqm').value = config.fabric.weight_per_sqm;
    document.getElementById('cost_per_gram').value = config.fabric.cost_per_gram;
    document.getElementById('selling_price_per_gram').value = config.fabric.selling_price_per_gram;
    document.getElementById('coloring_price').value = config.coloring.price;
    document.getElementById('none').value = config.printing.methods.none;
    document.getElementById('one_sided').value = config.printing.methods['1 sided'];
    document.getElementById('two_sided').value = config.printing.methods['2 sided'];
    document.getElementById('none_hand_attachment').value = config.hand_attachments.none;
    document.getElementById('pockets').value = config.hand_attachments.pockets;
    document.getElementById('zippers').value = config.hand_attachments.zippers;
    document.getElementById('embroidery').value = config.hand_attachments.embroidery;
    document.getElementById('tax').value = config.tax;
}

fetchConfig();