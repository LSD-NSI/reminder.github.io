document.getElementById('reminderForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nameInput = document.getElementById('reminderName');
    const dateInput = document.getElementById('reminderDate');
    const recurrenceInput = document.getElementById('recurrence');

    const reminderName = nameInput.value.trim();
    const reminderDate = new Date(dateInput.value);
    const recurrence = recurrenceInput.value;

    if (reminderName && reminderDate) {
        // Si la récurrence est 'none', ne pas ajouter la tâche à la liste
        if (recurrence === 'none') {
            alert('Cette tâche n\'a pas de récurrence et sera donc supprimée.');
            return; // Retourner sans ajouter la tâche si aucune récurrence n'est définie
        }

        // Ajouter un rappel si la récurrence est définie
        addReminder(reminderName, reminderDate, recurrence);

        // Réinitialiser le formulaire
        nameInput.value = '';
        dateInput.value = '';
        recurrenceInput.value = 'none';
    }
});

// Fonction pour ajouter un rappel à la liste
function addReminder(name, date, recurrence) {
    const reminderList = document.getElementById('reminderList');

    const listItem = document.createElement('li');
    const reminderText = document.createElement('span');
    reminderText.innerText = `${name}: ${date.toLocaleString()} (Répétition: ${getReadableRecurrence(recurrence)})`;

    const deleteButton = document.createElement('span');
    deleteButton.innerText = '❌';
    deleteButton.classList.add('delete');
    deleteButton.onclick = function() {
        reminderList.removeChild(listItem);
        clearNotification(date);
        saveReminders();
    };

    listItem.appendChild(reminderText);
    listItem.appendChild(deleteButton);
    reminderList.appendChild(listItem);

    // Planifier une notification pour ce rappel
    setNotification(name, date);

    // Sauvegarder les rappels dans localStorage
    saveReminders();
}

// Fonction pour rendre la récurrence lisible
function getReadableRecurrence(recurrence) {
    switch (recurrence) {
        case 'daily':
            return 'Tous les jours';
        case 'weekly':
            return 'Toutes les semaines';
        case 'monthly':
            return 'Tous les mois';
        case 'yearly':
            return 'Tous les ans';
        default:
            return 'Aucune';
    }
}

// Fonction pour enregistrer les rappels dans localStorage
function saveReminders() {
    const reminderList = [];
    const listItems = document.querySelectorAll('#reminderList li');

    listItems.forEach(item => {
        const name = item.querySelector('span').innerText.split(':')[0].trim();
        const date = new Date(item.querySelector('span').innerText.split('(')[0].trim().split(': ')[1]);
        const recurrence = item.querySelector('span').innerText.split('(')[1].split(')')[0].split(': ')[1];

        reminderList.push({ name, date, recurrence });
    });

    localStorage.setItem('reminders', JSON.stringify(reminderList));
}

// Fonction pour charger les rappels depuis localStorage
function loadReminders() {
    const storedReminders = JSON.parse(localStorage.getItem('reminders')) || [];

    storedReminders.forEach(reminder => {
        addReminder(reminder.name, new Date(reminder.date), reminder.recurrence);
    });
}

function setNotification(eventName, reminderDate) {
    const now = new Date();
    if (reminderDate > now) {
        const timeToWait = reminderDate.getTime() - now.getTime();

        // Vérification de la permission de notification
        if (Notification.permission === "granted") {
            setTimeout(() => {
                new Notification(eventName, {  // Nom de l'événement comme titre
                    body: `⏰ C'est le moment pour votre événement : "${eventName}" à ${reminderDate.toLocaleString()}! 🚀`,
                    icon: 'https://example.com/icon.png',  // Tu peux ajouter une icône ici
                });
            }, timeToWait);
        } else {
            // Demander la permission si elle n'a pas été donnée
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    setTimeout(() => {
                        new Notification(eventName, {  // Nom de l'événement comme titre
                            body: `⏰ C'est le moment pour votre événement : "${eventName}" à ${reminderDate.toLocaleString()}! 🚀`,
                            icon: 'https://example.com/icon.png',  // Ajouter une icône ici
                        });
                    }, timeToWait);
                }
            });
        }
    }
}

function clearNotification(reminderDate) {
    // Fonction pour effacer les notifications si nécessaire
}

// Charger les rappels enregistrés au démarrage de la page
window.onload = loadReminders;

