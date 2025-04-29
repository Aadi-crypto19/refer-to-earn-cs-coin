const userIdInput = document.getElementById('userId');
const referralCodeInput = document.getElementById('referralCodeInput');
const referralLink = document.getElementById('referralLink');
const referralCodeDisplay = document.getElementById('referralCode');
const rewardDisplay = document.getElementById('reward');

// Generate a unique referral code for each user
const generateReferralCode = () => {
    return 'USER' + Math.floor(Math.random() * 1000000);
};

// Set the user's referral code in the frontend
const setReferralCode = (userId) => {
    const code = generateReferralCode();
    referralCodeDisplay.innerText = code;
    referralLink.value = `https://yourapp.com?referralCode=${code}`;
};

// Handle the sign-up process
document.getElementById('signUpForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userId = userIdInput.value;
    const referralCode = referralCodeInput.value;
    
    fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, referralCode })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        setReferralCode(userId);
    })
    .catch(error => {
        alert('Error registering user: ' + error.message);
    });
});

// Copy referral link to clipboard
const copyReferralLink = () => {
    referralLink.select();
    document.execCommand('copy');
    alert('Referral link copied!');
};
