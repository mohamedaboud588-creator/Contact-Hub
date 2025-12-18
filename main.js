// Data storage with LocalStorage support
let contacts = loadContactsFromStorage();
let currentContactId = null;

// DOM Elements
const openModalBtn = document.getElementById("openModalBtn");
const contactModal = document.getElementById("contactModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const contactForm = document.getElementById("contactForm");
const modalTitle = document.getElementById("modalTitle");
const contactList = document.getElementById("contactList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const favoritesList = document.getElementById("favoritesList");
const emergencyList = document.getElementById("emergencyList");
const totalContactsEl = document.getElementById("totalContacts");
const favoriteContactsEl = document.getElementById("favoriteContacts");
const emergencyContactsEl = document.getElementById("emergencyContacts");
const contactsCountEl = document.getElementById("contactsCount");
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");

// Load contacts from localStorage
function loadContactsFromStorage() {
  try {
    const savedContacts = localStorage.getItem("contacthub_contacts");
    if (savedContacts) {
      return JSON.parse(savedContacts);
    }
  } catch (error) {
    console.error("Error loading contacts from storage:", error);
  }
  return [];
}

// Save contacts to localStorage
function saveContactsToStorage() {
  try {
    localStorage.setItem("contacthub_contacts", JSON.stringify(contacts));
  } catch (error) {
    console.error("Error saving contacts to storage:", error);
  }
}

// Open modal
openModalBtn.addEventListener("click", () => {
  resetForm();
  modalTitle.textContent = "Add New Contact";
  contactModal.classList.add("active");
});

// Close modal
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

// Close modal when clicking outside
contactModal.addEventListener("click", (e) => {
  if (e.target === contactModal) {
    closeModal();
  }
});

// Handle avatar upload
avatarInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
    };
    reader.readAsDataURL(file);
  }
});

// Form submission
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let avatarUrl = "";
  const avatarImg = avatarPreview.querySelector("img");
  if (avatarImg) {
    avatarUrl = avatarImg.src;
  }

  const contact = {
    id: currentContactId || Date.now().toString(),
    name: document.getElementById("contactName").value.trim(),
    phone: document.getElementById("contactPhone").value.trim(),
    email: document.getElementById("contactEmail").value.trim(),
    address: document.getElementById("contactAddress").value.trim(),
    group: document.getElementById("contactGroup").value,
    notes: document.getElementById("contactNotes").value.trim(),
    isFavorite: document.getElementById("isFavorite").checked,
    isEmergency: document.getElementById("isEmergency").checked,
    avatar: avatarUrl,
    dateAdded: new Date().toISOString(),
  };

  // Validate required fields
  if (!contact.name || !contact.phone) {
    alert("Please fill in all required fields (Name and Phone)");
    return;
  }

  if (currentContactId) {
    // Update existing contact
    const index = contacts.findIndex((c) => c.id === currentContactId);
    if (index !== -1) {
      contacts[index] = contact;
    }
  } else {
    // Add new contact
    contacts.push(contact);
  }

  // Save to localStorage
  saveContactsToStorage();
  updateUI();
  closeModal();
  showNotification("Contact saved successfully!");
});

// Close modal function
function closeModal() {
  contactModal.classList.remove("active");
  resetForm();
}

// Reset form
function resetForm() {
  contactForm.reset();
  currentContactId = null;
  avatarPreview.innerHTML =
    '<div class="avatar-placeholder"><i class="fas fa-user"></i></div>';
}

// Update all UI elements
function updateUI() {
  updateContactsList();
  updateStats();
  updateSidebars();
}

// Update contacts list
function updateContactsList() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.phone.includes(searchTerm) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm))
  );

  if (filteredContacts.length === 0) {
    emptyState.style.display = "block";
    contactList.innerHTML = "";
    contactList.appendChild(emptyState);
  } else {
    emptyState.style.display = "none";
    contactList.innerHTML = "";

    filteredContacts.forEach((contact) => {
      const contactCard = createContactCard(contact);
      contactList.appendChild(contactCard);
    });
  }

  contactsCountEl.textContent = `Manage and organize your ${contacts.length} contacts`;
}

// Create contact card
function createContactCard(contact) {
  const div = document.createElement("div");
  div.className = "contact-card";
  div.dataset.id = contact.id;

  // Get initials for avatar
  const initials = contact.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  // Avatar HTML
  let avatarHtml = "";
  if (contact.avatar) {
    avatarHtml = `<img src="${contact.avatar}" alt="${contact.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
  } else {
    avatarHtml = `${initials}`;
  }

  // Group tag
  const groupClassMap = {
    family: "family",
    friends: "friends",
    work: "work",
    school: "school",
    other: "other",
  };

  const groupClass = groupClassMap[contact.group] || "other";
  const groupText = contact.group
    ? contact.group.charAt(0).toUpperCase() + contact.group.slice(1)
    : "";

  div.innerHTML = `
        <div class="contact-header">
            <div class="avatar-container">
                <div class="avatar">
                    ${avatarHtml}
                </div>
                ${
                  contact.isFavorite
                    ? `<div class="status-badge star"><i class="fas fa-star"></i></div>`
                    : ""
                }
                ${
                  contact.isEmergency
                    ? `<div class="emergency-badge">                            <i class="fas fa-heart-pulse"></i>
</div>`
                    : ""
                }
            </div>
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-detail phone">
                    <i class="fas fa-phone"></i>
                    <span>${contact.phone}</span>
                </div>
                ${
                  contact.email
                    ? `<div class="contact-detail email"><i class="fas fa-envelope"></i><span>${contact.email}</span></div>`
                    : ""
                }
                ${
                  contact.address
                    ? `<div class="contact-detail location"><i class="fas fa-map-marker-alt"></i><span>${contact.address}</span></div>`
                    : ""
                }
            </div>
        </div>
        <div class="tags">
            ${
              groupText
                ? `<span class="tag ${groupClass}">${groupText}</span>`
                : ""
            }
            ${
              contact.isFavorite
                ? `<span class="tag favorite-tag"><i class="fas fa-star"></i>Favorite</span>`
                : ""
            }
            ${
              contact.isEmergency
                ? `<span class="tag emergency-tag"><i class="fas fa-heart"></i>Emergency</span>`
                : ""
            }
        </div>
        <div class="actions">
            <div class="left-actions">
                <button class="action-btn phone-btn" onclick="callContact('${
                  contact.phone
                }')">
                    <i class="fas fa-phone"></i>
                </button>
                ${
                  contact.email
                    ? `<button class="action-btn email-btn" onclick="emailContact('${contact.email}')"><i class="fas fa-envelope"></i></button>`
                    : ""
                }
            </div>
            <div class="right-actions">
                
                <button class="action-btn star-btn ${
                  contact.isFavorite ? "active" : ""
                }" onclick="toggleFavorite('${contact.id}')">
                    <i class="fas fa-star"></i>
                </button>
                <button class="action-btn heart-btn ${
                  contact.isEmergency ? "active" : ""
                }" onclick="toggleEmergency('${contact.id}')">
                            <i class="fas fa-heart-pulse"></i>
                </button>
                <button class="action-btn edit-btn" onclick="editContact('${
                  contact.id
                }')">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteContact('${
                  contact.id
                }')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;

  return div;
}

// Update stats
function updateStats() {
  const total = contacts.length;
  const favorites = contacts.filter((c) => c.isFavorite).length;
  const emergency = contacts.filter((c) => c.isEmergency).length;

  totalContactsEl.textContent = total;
  favoriteContactsEl.textContent = favorites;
  emergencyContactsEl.textContent = emergency;
}

// Update sidebars
function updateSidebars() {
  updateFavoritesList();
  updateEmergencyList();
}

// Update favorites sidebar
function updateFavoritesList() {
  const favoriteContacts = contacts.filter((c) => c.isFavorite);

  if (favoriteContacts.length === 0) {
    favoritesList.innerHTML =
      '<div class="empty-sidebar">No favorites yet</div>';
  } else {
    favoritesList.innerHTML = "";
    favoriteContacts.forEach((contact) => {
      const sidebarContact = createSidebarContact(contact);
      favoritesList.appendChild(sidebarContact);
    });
  }
}

// Update emergency sidebar
function updateEmergencyList() {
  const emergencyContacts = contacts.filter((c) => c.isEmergency);

  if (emergencyContacts.length === 0) {
    emergencyList.innerHTML =
      '<div class="empty-sidebar">No emergency contacts</div>';
  } else {
    emergencyList.innerHTML = "";
    emergencyContacts.forEach((contact) => {
      const sidebarContact = createSidebarContact(contact);
      emergencyList.appendChild(sidebarContact);
    });
  }
}

// Create sidebar contact
function createSidebarContact(contact) {
  const div = document.createElement("div");
  div.className = "sidebar-contact";
  div.dataset.id = contact.id;

  // Get initials for avatar
  const initials = contact.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  // Avatar HTML
  let avatarHtml = "";
  if (contact.avatar) {
    avatarHtml = `<img src="${contact.avatar}" alt="${contact.name}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">`;
  } else {
    avatarHtml = `${initials}`;
  }

  div.innerHTML = `
        <div class="contact-header">
            <div class="avatar-container">
                <div class="avatar">
                    ${avatarHtml}
                </div>
            </div>
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-detail phone">
                    <i class="fas fa-phone"></i>
                    <span>${contact.phone}</span>
                </div>
            </div>
        </div>
    `;

  // Add click event
  div.addEventListener("click", (e) => {
    if (!e.target.closest(".tag")) {
      scrollToContact(contact.id);
    }
  });

  return div;
}

// Contact actions
window.toggleFavorite = function (id) {
  const contact = contacts.find((c) => c.id === id);
  if (contact) {
    contact.isFavorite = !contact.isFavorite;
    saveContactsToStorage(); // Save to localStorage
    updateUI();
    showNotification(
      contact.isFavorite ? "Added to favorites" : "Removed from favorites"
    );
  }
};

window.toggleEmergency = function (id) {
  const contact = contacts.find((c) => c.id === id);
  if (contact) {
    contact.isEmergency = !contact.isEmergency;
    saveContactsToStorage(); // Save to localStorage
    updateUI();
    showNotification(
      contact.isEmergency
        ? "Marked as emergency contact"
        : "Removed from emergency contacts"
    );
  }
};

window.callContact = function (phone) {
  alert(`Calling ${phone}...`);
};

window.emailContact = function (email) {
  alert(`Opening email to ${email}...`);
};

window.editContact = function (id) {
  const contact = contacts.find((c) => c.id === id);
  if (contact) {
    document.getElementById("contactName").value = contact.name;
    document.getElementById("contactPhone").value = contact.phone;
    document.getElementById("contactEmail").value = contact.email || "";
    document.getElementById("contactAddress").value = contact.address || "";
    document.getElementById("contactGroup").value = contact.group || "";
    document.getElementById("contactNotes").value = contact.notes || "";
    document.getElementById("isFavorite").checked = contact.isFavorite;
    document.getElementById("isEmergency").checked = contact.isEmergency;
    document.getElementById("contactId").value = contact.id;

    // Set avatar preview
    if (contact.avatar) {
      avatarPreview.innerHTML = `<img src="${contact.avatar}" alt="Avatar">`;
    } else {
      avatarPreview.innerHTML =
        '<div class="avatar-placeholder"><i class="fas fa-user"></i></div>';
    }

    currentContactId = id;
    modalTitle.textContent = "Edit Contact";
    contactModal.classList.add("active");
  }
};

window.deleteContact = function (id) {
  if (confirm("Are you sure you want to delete this contact?")) {
    contacts = contacts.filter((c) => c.id !== id);
    saveContactsToStorage(); // Save to localStorage
    updateUI();
    showNotification("Contact deleted successfully");
  }
};

// Scroll to contact in main list
function scrollToContact(id) {
  const contactElement = document.querySelector(
    `.contact-card[data-id="${id}"]`
  );
  if (contactElement) {
    contactElement.scrollIntoView({ behavior: "smooth", block: "center" });

    // Highlight temporarily
    contactElement.style.backgroundColor = "#e0e7ff";
    setTimeout(() => {
      contactElement.style.backgroundColor = "";
    }, 1000);
  }
}

// Search functionality
searchInput.addEventListener("input", updateContactsList);

// Show notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 600;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add CSS for notification animation
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize with data from localStorage
window.addEventListener("DOMContentLoaded", () => {
  updateUI();
  console.log("Contacts loaded from localStorage:", contacts.length);
});

// Uncomment the line below to add sample contacts automatically
// addSampleContacts();

// Optional: Add clear all contacts function (for testing)
window.clearAllContacts = function () {
  if (confirm("Are you sure you want to delete ALL contacts?")) {
    contacts = [];
    saveContactsToStorage();
    updateUI();
    showNotification("All contacts have been cleared");
  }
};
