const apiKey = "2493aec7-2817-4674-af86-3cc1e70ca721";

const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get("email") || localStorage.getItem("regEmail");

const emailDisplay = document.getElementById("userEmailDisplay");
if (emailDisplay && email) {
    emailDisplay.textContent = email;
}

const verifyForm = document.getElementById("verifyForm");
if (verifyForm) {
    verifyForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const code = document.getElementById("verificationCode").value.trim();

        if (!email) {
            alert("მეილი ვერ მოიძებნა. გთხოვთ თავიდან გაიაროთ რეგისტრაცია.");
            window.location.href = "signup.html";
            return;
        }

        try {
            const response = await fetch("https://restaurantapi.stepacademy.ge/api/auth/verify-email", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "X-API-KEY": apiKey
                },
                body: JSON.stringify({
                    email: email,
                    code: code
                })
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                const resultData = data.data || {};
                if (resultData.accessToken) {
                    localStorage.setItem("accessToken", resultData.accessToken);
                }
                if (resultData.refreshToken) {
                    localStorage.setItem("refreshToken", resultData.refreshToken);
                }

                alert("ვერიფიკაცია წარმატებით დასრულდა!");
                localStorage.removeItem("regEmail");
                window.location.href = "login.html";
            } else {
                alert("ვერიფიკაციის შეცდომა: " + (data.detail || data.title || "არასწორი კოდი"));
            }
        } catch (err) {
            console.error(err);
            alert("კავშირის შეცდომა ვერიფიკაციისას.");
        }
    });
}