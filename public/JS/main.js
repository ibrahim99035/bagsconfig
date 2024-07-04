// Fetch configuration data
async function fetchConfig() {
    const response = await fetch('JSON/config.json');
    return await response.json();
}

// Calculate area and weight
async function calculateAreaAndWeight(heightCm, widthCm, bottomSpaceCm) {
    const config = await fetchConfig();

    // Convert centimeters to meters
    const height = heightCm / 100;
    const width = widthCm / 100;
    const bottomSpace = bottomSpaceCm / 100;

    // Get fabric weight per square meter from config
    const weightPerSqm = config.fabric.weight_per_sqm;

    // Calculate area
    const area = 2 * (width * height) + 2 * (height * bottomSpace) + (width * bottomSpace);

    // Calculate weight
    const weight = area * weightPerSqm;

    return { area, weight };
}

// Get cost price and selling price based on weight
async function calculatePrices(weight) {
    const config = await fetchConfig();

    // Get cost per gram and selling price per gram from config
    const costPerGram = config.fabric.cost_per_gram;
    const sellingPricePerGram = config.fabric.selling_price_per_gram;

    // Calculate cost price and selling price
    const costPrice = weight * costPerGram;
    const sellingPrice = weight * sellingPricePerGram;

    return { costPrice, sellingPrice };
}

// Calculate coloring and printing costs
async function calculateColoringAndPrintingCosts(counter, printingMethod) {
    const config = await fetchConfig();

    // Get the coloring price from config
    const coloringPrice = config.coloring.price;

    // Get the printing method multiplier from config
    const printingMethods = config.printing.methods;
    const printingMultiplier = printingMethods[printingMethod];

    if (printingMultiplier === undefined) {
        throw new Error(`Invalid printing method: ${printingMethod}`);
    }

    // Calculate the total price
    const totalPrice = counter * coloringPrice * printingMultiplier;

    return totalPrice;
}

// Document ready function
document.addEventListener('DOMContentLoaded', async function() {
    // Fetch configuration data
    const config = await fetchConfig();

    populateSelect('handAttachment', config.hand_attachments);
    populateSelect('printingMethod', config.printing.methods);

    // Populate select options
    function populateSelect(elementId, options) {
        const selectElement = document.getElementById(elementId);
        for (const key in options) {
            const option = document.createElement('option');
            option.value = key;
            option.text = key;
            selectElement.appendChild(option);
        }
    }

    // Handle form submission
    document.getElementById('fabricForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        // Get form values
        const height = parseFloat(document.getElementById('height').value);
        const width = parseFloat(document.getElementById('width').value);
        const bottomSpace = parseFloat(document.getElementById('bottomSpace').value);
        const quantity = parseInt(document.getElementById('quantity').value);
        const colorCount = parseInt(document.getElementById('colorCount').value);
        const handAttachment = document.getElementById('handAttachment').value;
        const printingMethod = document.getElementById('printingMethod').value;
        const mainColor = document.getElementById('mainColor').value;

        try {
            // Perform calculations
            const { area, weight } = await calculateAreaAndWeight(height, width, bottomSpace);
            const { costPrice, sellingPrice } = await calculatePrices(weight);
            const coloringAndPrintingCost = await calculateColoringAndPrintingCosts(colorCount, printingMethod);

            // Fetch configuration data
            const config = await fetchConfig();
            const handAttachmentCost = config.hand_attachments[handAttachment];
            const taxRate = config.tax;

            if (handAttachmentCost === undefined) {
                throw new Error(`Invalid hand attachment: ${handAttachment}`);
            }

            // Calculate final cost and selling prices with hand attachment and tax
            const finalCostPrice = (costPrice + coloringAndPrintingCost +handAttachmentCost * quantity) * (1 + taxRate);
            const finalSellingPrice = (sellingPrice + coloringAndPrintingCost + handAttachmentCost * quantity) * (1 + taxRate);
            const OrderWeight = weight * quantity;
            const data = {
                height, width, bottomSpace, quantity, colorCount, mainColor,
                handAttachment, printingMethod, area, weight,
                costPrice, sellingPrice,
                coloringAndPrintingCost
            };

            console.log(data);

            const response = await fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = `
                    <p>Area: ${area.toFixed(2)} square meters</p>
                    <p>Weight: ${weight.toFixed(2)} grams</p>
                    <p>Cost Price: $${costPrice.toFixed(2)}</p>
                    <p>Selling Price: $${sellingPrice.toFixed(2)}</p>
                    <p>Coloring and Printing Cost: $${coloringAndPrintingCost.toFixed(2)}</p>
                    <p>Total Price: $${finalSellingPrice.toFixed(2)}</p>
                    <p>Order Weight: $${OrderWeight.toFixed(2)}</p>
                `;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error(error.message);
        }
    });
});
