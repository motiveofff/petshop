document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Успешный вход!");
            localStorage.setItem("userName", result.userName); // Сохраняем имя пользователя
            window.location.href = "index.html";  // Перенаправляем на главную
        } else {
            alert(result.error || "Ошибка входа.");
        }
    } catch (error) {
        alert("Ошибка подключения к серверу.");
    }
});
