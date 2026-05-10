// portfolio/firebase-server/auth.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { writeToTerminal } from '../animations.js';

const firebaseConfig = {
    apiKey: "AIzaSyCpB85Nt0M5IVsg2fYvG-NBaw27Hil0fQU",
    authDomain: "portfolio-1d58b.firebaseapp.com",
    projectId: "portfolio-1d58b",
    storageBucket: "portfolio-1d58b.firebasestorage.app",
    messagingSenderId: "735127370515",
    appId: "1:735127370515:web:7e558bfebfbd44a1e8b8e6",
    measurementId: "G-0EV7QYG14C"
};

export const initAuth = () => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();

    // Auth UI Elements
    const authLoggedOutView = document.getElementById('auth-logged-out');
    const authLoggedInView = document.getElementById('auth-logged-in');
    const authStatusLabel = document.getElementById('auth-status-label');
    const userDisplayNameEl = document.getElementById('user-display-name');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (authLoggedOutView) authLoggedOutView.style.display = 'none';
            if (authLoggedInView) authLoggedInView.style.display = 'block';
            if (authStatusLabel) {
                authStatusLabel.innerText = "AUTHENTICATED";
                authStatusLabel.style.color = "var(--accent-green)";
            }
            if (userDisplayNameEl) userDisplayNameEl.innerText = user.displayName || user.email;
        } else {
            if (authLoggedOutView) authLoggedOutView.style.display = 'block';
            if (authLoggedInView) authLoggedInView.style.display = 'none';
            if (authStatusLabel) {
                authStatusLabel.innerText = "LOCKED";
                authStatusLabel.style.color = "var(--text-muted)";
            }
        }
    });

    // Login Actions
    document.getElementById('btn-login')?.addEventListener('click', async () => {
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-pass').value;
        if (!email || !pass) return writeToTerminal("> AUTH: MISSING_CREDENTIALS");
        
        writeToTerminal("> AUTH: INITIATING_LOGIN...");
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            writeToTerminal("> AUTH: ACCESS_GRANTED");
        } catch (e) {
            writeToTerminal(`> AUTH_ERROR: ${e.code}`);
        }
    });

    document.getElementById('btn-register')?.addEventListener('click', async () => {
        const name = document.getElementById('auth-name').value;
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-pass').value;
        if (!email || !pass || !name) return writeToTerminal("> AUTH: REGISTRATION_DATA_INCOMPLETE");

        writeToTerminal("> AUTH: CREATING_IDENTITY...");
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(userCred.user, { displayName: name });
            writeToTerminal("> AUTH: IDENTITY_VERIFIED");
        } catch (e) {
            writeToTerminal(`> AUTH_ERROR: ${e.code}`);
        }
    });

    document.getElementById('btn-google')?.addEventListener('click', async () => {
        writeToTerminal("> AUTH: CONNECTING_EXTERNAL_PROVIDER...");
        try {
            await signInWithPopup(auth, googleProvider);
            writeToTerminal("> AUTH: GOOGLE_AUTH_SUCCESS");
        } catch (e) {
            writeToTerminal(`> AUTH_ERROR: ${e.code}`);
        }
    });

    document.getElementById('btn-logout')?.addEventListener('click', async () => {
        writeToTerminal("> AUTH: TERMINATING_SESSION...");
        try {
            await signOut(auth);
            writeToTerminal("> AUTH: SESSION_CLOSED");
        } catch (e) {
            writeToTerminal(`> AUTH_ERROR: ${e.code}`);
        }
    });
};