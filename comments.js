import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const appRoot = document.querySelector("[data-comments-page]");
if (appRoot) boot(appRoot);

function boot(root) {
  const pageId = root.dataset.commentsPage;
  const status = root.querySelector("[data-comments-status]");
  const googleButton = root.querySelector("[data-google-sign-in]");
  const signOutButton = root.querySelector("[data-sign-out]");
  const composeForm = root.querySelector("[data-comment-form]");
  const textArea = root.querySelector("[data-comment-text]");
  const counter = root.querySelector("[data-comment-counter]");
  const list = root.querySelector("[data-comment-list]");
  const appConfigReady = firebaseConfig.apiKey && firebaseConfig.appId
    && !firebaseConfig.apiKey.startsWith("REPLACE_")
    && !firebaseConfig.appId.startsWith("REPLACE_");

  if (!appConfigReady) {
    setStatus(status, "O módulo de comentários aguarda a configuração do app Web do Firebase.", "error");
    if (googleButton) googleButton.disabled = true;
    return;
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const db = getFirestore(app);
  const commentsRef = collection(db, "radioComments", pageId, "comments");
  const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"), limit(50));
  let currentUser = null;
  let unsubscribeComments = null;

  googleButton?.addEventListener("click", async () => {
    googleButton.disabled = true;
    try {
      await signInWithPopup(auth, googleProvider);
      setStatus(status, "Conta Google conectada.", "success");
    } catch (error) {
      setStatus(status, authMessage(error));
    } finally {
      googleButton.disabled = false;
    }
  });

  signOutButton?.addEventListener("click", async () => {
    try { await signOut(auth); setStatus(status, "Você saiu da conta.", "success"); }
    catch (error) { setStatus(status, authMessage(error)); }
  });

  textArea?.addEventListener("input", () => { counter.textContent = textArea.value.length + "/500"; });

  composeForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = textArea.value.trim();
    if (!currentUser || !currentUser.emailVerified) {
      setStatus(status, "Use uma conta Google com endereço de e-mail verificado para comentar.");
      return;
    }
    if (!body || body.length > 500) {
      setStatus(status, "O comentário deve ter entre 1 e 500 caracteres.");
      return;
    }
    const submit = composeForm.querySelector("button[type=submit]");
    submit.disabled = true;
    try {
      await addDoc(commentsRef, {
        uid: currentUser.uid,
        author: (currentUser.displayName || currentUser.email.split("@")[0]).slice(0, 32),
        body,
        createdAt: serverTimestamp()
      });
      textArea.value = "";
      counter.textContent = "0/500";
      setStatus(status, "Comentário publicado.", "success");
    } catch (error) {
      setStatus(status, authMessage(error));
    } finally {
      submit.disabled = false;
    }
  });

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const isVerified = Boolean(user?.emailVerified);
    root.querySelector("[data-auth-form-wrap]").hidden = Boolean(user);
    root.querySelector("[data-signed-in]").hidden = !user;
    composeForm.hidden = !isVerified;
    signOutButton.hidden = !user;
    root.querySelector("[data-user-label]").textContent = user
      ? (user.displayName || user.email || "Conta conectada")
      : "";
    if (user && !isVerified) {
      setStatus(status, "Esta conta Google não informa um e-mail verificado e não pode publicar comentários.");
    }
  });

  unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
    list.replaceChildren();
    if (snapshot.empty) {
      const empty = document.createElement("p");
      empty.className = "comments-empty";
      empty.textContent = "Ainda não há comentários nesta página. Inicie a conversa.";
      list.append(empty);
      return;
    }
    snapshot.forEach((record) => list.append(renderComment(record)));
  }, (error) => setStatus(status, authMessage(error)));

  function renderComment(record) {
    const data = record.data();
    const article = document.createElement("article");
    article.className = "comment-item";
    const header = document.createElement("div");
    header.className = "comment-head";
    const author = document.createElement("span");
    author.className = "comment-author";
    author.textContent = data.author || "Manager";
    const time = document.createElement("time");
    time.className = "comment-time";
    time.textContent = formatDate(data.createdAt?.toDate?.());
    header.append(author, time);
    const body = document.createElement("p");
    body.className = "comment-body";
    body.textContent = data.body || "";
    article.append(header, body);
    if (currentUser && currentUser.uid === data.uid) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "comment-delete";
      remove.textContent = "Excluir meu comentário";
      remove.addEventListener("click", async () => {
        if (!window.confirm("Excluir este comentário?")) return;
        try { await deleteDoc(doc(db, "radioComments", pageId, "comments", record.id)); }
        catch (error) { setStatus(status, authMessage(error)); }
      });
      article.append(remove);
    }
    return article;
  }

  window.addEventListener("pagehide", () => unsubscribeComments?.(), { once: true });
}

function setStatus(element, message, tone) {
  if (!element) return;
  element.textContent = message;
  element.dataset.tone = tone || "";
}

function formatDate(date) {
  if (!date) return "Agora mesmo";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function authMessage(error) {
  const messages = {
    "auth/popup-closed-by-user": "A janela de autenticação foi fechada antes da conclusão.",
    "auth/popup-blocked": "O navegador bloqueou a janela do Google. Permita pop-ups para este site e tente novamente.",
    "auth/unauthorized-domain": "Este domínio ainda não está autorizado para autenticação no Firebase.",
    "auth/cancelled-popup-request": "A autenticação já está em andamento em outra janela.",
    "permission-denied": "A operação foi recusada pelas regras do Firestore. Verifique se elas foram publicadas.",
    "unavailable": "O serviço está temporariamente indisponível. Tente novamente."
  };
  if (error?.message && !error.code) return error.message;
  return messages[error?.code] || "Não foi possível concluir a operação. Confira a configuração do Firebase e tente novamente.";
}
