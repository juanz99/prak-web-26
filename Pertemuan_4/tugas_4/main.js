let projects = [
    {
        id: 1,
        title: "Sistem Inventaris Keuangan",
        category: "Web App",
        budget: 2500000,
        completed: true
    },
    {
        id: 2,
        title: "Sistem Kasir Digital POS",
        category: "Desktop App",
        budget: 5000000,
        completed: true
    },
    {
        id: 3,
        title: "Landing Page Profil Perusahaan",
        category: "Web App",
        budget: 1500000,
        completed: false
    },
    {
        id: 4,
        title: "Aplikasi Presensi GPS Mobile",
        category: "Mobile App",
        budget: 4500000,
        completed: false
    },
];

let activeCategory = "Semua";
let searchKeyword = "";

const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);
};

const updateStats = () => {
    const totalProjects = projects.length;
    const totalBudget = projects.reduce((total, project) => total + project.budget, 0);
    const completedCount = projects.filter(project => project.completed).length;

    document.getElementById("stat-total-projects").textContent = totalProjects;
    document.getElementById("stat-total-budget").textContent = formatRupiah(totalBudget);
    document.getElementById("stat-completed-projects").textContent = completedCount;
};

const getVisibleProjects = () => {
    return projects.filter(project => {
        const matchesCategory =
            activeCategory === "Semua" || project.category === activeCategory;

        const matchesSearch = project.title
            .toLowerCase()
            .includes(searchKeyword.toLowerCase());

        return matchesCategory && matchesSearch;
    });
};

const renderProjects = () => {
    const container = document.getElementById("project-list");
    const visibleProjects = getVisibleProjects();

    if (visibleProjects.length === 0) {
        container.innerHTML = '<p class="empty-state">Tidak ada proyek yang sesuai dengan pencarian atau filter ini.</p>';
        return;
    }

    container.innerHTML = visibleProjects.map(project => {
        const badgeClass = project.completed ? "badge-success" : "badge-pending";
        const statusText = project.completed ? "Selesai" : "Dalam Pengerjaan";

        return `
            <article class="project-card">
                <div class="project-info">
                    <span class="project-category">${project.category}</span>
                    <h4>${escapeHTML(project.title)}</h4>
                    <p class="project-budget">${formatRupiah(project.budget)}</p>
                    <span class="badge ${badgeClass}">${statusText}</span>
                </div>
                <div class="project-actions">
                    <button type="button" class="btn btn-warning" data-action="toggle" data-id="${project.id}">
                        Ubah Status
                    </button>
                    <button type="button" class="btn btn-danger" data-action="delete" data-id="${project.id}">
                        Hapus Proyek
                    </button>
                </div>
            </article>
        `;
    }).join("");
};

const escapeHTML = (text) => {
    return String(text).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
};

const refreshDashboard = () => {
    renderProjects();
    updateStats();
};

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("project-form");
    const titleInput = document.getElementById("project-title");
    const categoryInput = document.getElementById("project-category");
    const budgetInput = document.getElementById("project-budget");
    const completedInput = document.getElementById("project-completed");
    const searchInput = document.getElementById("project-search");
    const formMessage = document.getElementById("form-message");
    const filterButtons = document.querySelectorAll(".btn-filter");
    const projectList = document.getElementById("project-list");

    form.addEventListener("submit", event => {
        event.preventDefault();

        const title = titleInput.value.trim();
        const category = categoryInput.value;
        const budget = Number(budgetInput.value);
        const completed = completedInput.checked;

        if (title === "") {
            showMessage("Judul proyek tidak boleh kosong.", "error");
            titleInput.focus();
            return;
        }

        if (!Number.isFinite(budget) || budget <= 0) {
            showMessage("Anggaran harus berupa angka lebih besar dari 0.", "error");
            budgetInput.focus();
            return;
        }

        const newProject = {
            id: Date.now(),
            title: title,
            category: category,
            budget: budget,
            completed: completed
        };

        projects = [...projects, newProject];

        showMessage("Proyek berhasil ditambahkan.", "success");
        form.reset();

        categoryInput.value = "Web App";
        refreshDashboard();
    });

    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `message ${type}`;
    }

    searchInput.addEventListener("input", event => {
        searchKeyword = event.target.value.trim();
        renderProjects();
    });

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            activeCategory = button.dataset.category;
            renderProjects();
        });
    });

    projectList.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === "toggle") {
            projects = projects.map(project =>
                project.id === id
                    ? { ...project, completed: !project.completed }
                    : project
            );
        } else if (action === "delete") {
            const confirmed = window.confirm("Yakin ingin menghapus proyek ini?");
            if (!confirmed) return;

            projects = projects.filter(project => project.id !== id);
        }

        refreshDashboard();
    });

    refreshDashboard();
});
