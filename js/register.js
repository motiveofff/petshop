document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();  // Останавливает стандартное поведение формы

    // Получение значений полей формы
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Проверка на совпадение паролей
    if (password !== confirmPassword) {
        alert("Пароли не совпадают!");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Регистрация успешна!");
            window.location.href = "avtoriz.html";  // Перенаправление на страницу входа
        } else {
            alert(result.error || "Ошибка регистрации");
        }
    } catch (error) {
        alert("Ошибка подключения к серверу!");
    }
});
