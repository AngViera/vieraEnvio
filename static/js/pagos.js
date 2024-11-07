const stripe = Stripe('pk_test_51PzKbpIIN8kEZxuIBpND51Ymh6cUL7nbjQ7QJecZqlpoUVgBcdWgnuYKm5a6jiXqFxy36MobKhCDccvQl7A1xaA000cd3goty1'); // Tu clave pública
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

const form = document.getElementById('payment-form');
const paymentMessage = document.getElementById('payment-message');
const buttonPago = document.getElementById('button-pago');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    buttonPago.disabled = true;
    buttonPago.classList.add('loading');
    paymentMessage.classList.add('hidden');

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    // Monto a enviar en COP, asegurarte de convertirlo a centavos
    const amount = 12000 * 100; // 12,000 COP = 1,200,000 centavos

    try {
        console.log("Solicitando PaymentIntent al servidor...");
        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amount, currency: 'cop' }) // Asegúrate de que el monto sea correcto
        });

        if (!response.ok) {
            const errorData = await response.json(); // Captura el mensaje de error del servidor
            throw new Error(errorData.error || 'Error en la creación del PaymentIntent.');
        }

        const { clientSecret } = await response.json();
        console.log("Client secret recibido:", clientSecret);

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: name,
                    email: email,
                },
            },
        });

        if (error) {
            paymentMessage.textContent = error.message;
            paymentMessage.classList.add('error');
            paymentMessage.classList.remove('hidden');
            console.error("Error al confirmar el pago:", error);
        } else if (paymentIntent.status === 'succeeded') {
            paymentMessage.textContent = 'Pago completado con éxito! 🎉';
            paymentMessage.classList.add('success');
            paymentMessage.classList.remove('hidden');
        }
    } catch (err) {
        console.error("Error:", err);
        paymentMessage.textContent = 'Error en la creación del PaymentIntent.';
        paymentMessage.classList.add('error');
        paymentMessage.classList.remove('hidden');
    } finally {
        buttonPago.disabled = false;
        buttonPago.classList.remove('loading');
    }
});
