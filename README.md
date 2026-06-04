<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=4&section=header"/>
  <br/>
  <h1>🍎 Newton's Apple</h1>
  <h3>Interactive Physics Simulation Laboratory</h3>
  <br/>
  <p>
    <a href="https://sudarshandev-llm.github.io/newton-simulation-appletheory/" target="_blank">
      <img src="https://img.shields.io/badge/🚀-Live%20Demo-6C63FF?style=for-the-badge&logo=githubpages&logoColor=white"/>
    </a>
    <a href="#installation">
      <img src="https://img.shields.io/badge/📦-Installation-28a745?style=for-the-badge"/>
    </a>
    <a href="https://github.com/sudarshandev-llm/newton-simulation-appletheory/issues">
      <img src="https://img.shields.io/badge/🐛-Report%20Bug-d73a4a?style=for-the-badge"/>
    </a>
  </p>
  <p>
    <img src="https://img.shields.io/github/last-commit/sudarshandev-llm/newton-simulation-appletheory?style=flat-square&color=6C63FF"/>
    <img src="https://img.shields.io/github/repo-size/sudarshandev-llm/newton-simulation-appletheory?style=flat-square&color=6C63FF"/>
    <img src="https://img.shields.io/github/languages/top/sudarshandev-llm/newton-simulation-appletheory?style=flat-square&color=6C63FF"/>
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square"/>
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react"/>
    <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite"/>
    <img src="https://img.shields.io/badge/Matter.js-physics-FF6B6B?style=flat-square"/>
  </p>
  <br/>
</div>

## 📋 Overview

**Newton's Apple** is an interactive physics simulation that lets you drop an apple under different gravitational conditions and observe real-time physics data. Built with React 18 and Matter.js, it provides an engaging way to learn about gravity, acceleration, force, and motion.

**✨ Designed & developed by Team Alum / Alumni AI**

### 🎯 Key Features

| Feature | Description |
|---------|-------------|
| 🌍 **Multi-Planet Gravity** | Drop apples on Earth, Moon, Mars, or Jupiter — each with accurate gravity |
| 📊 **Real-time Telemetry** | Watch velocity, acceleration, force & distance update every frame |
| 🌀 **Wind Simulation** | Add horizontal wind force and see its effect on trajectory |
| 🐌 **Slow Motion** | Slow down time to observe physics in detail |
| 🎯 **Adjustable Drop Height** | Set initial height from 1m to 50m |
| 🔄 **Air Resistance Toggle** | Compare ideal vs. real-world physics |
| 🧪 **Quiz Mode** | Test your physics knowledge with interactive challenges |
| 📐 **Formula Cards** | View the actual physics equations behind the simulation |
| 🌓 **Dark/Light Theme** | Toggle between eye-friendly themes |
| ✨ **Glassmorphism UI** | Modern, aesthetic interface with smooth animations |

---

## 🖼️ Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>Simulation View</strong></td>
      <td align="center"><strong>Planet Selection</strong></td>
    </tr>
    <tr>
      <td><img src="https://via.placeholder.com/400x250/1a1a2e/6C63FF?text=Simulation+Dashboard" alt="Simulation View" width="400"/></td>
      <td><img src="https://via.placeholder.com/400x250/1a1a2e/6C63FF?text=Planet+Selector" alt="Planet Selection" width="400"/></td>
    </tr>
    <tr>
      <td align="center"><strong>Data Dashboard</strong></td>
      <td align="center"><strong>Quiz Mode</strong></td>
    </tr>
    <tr>
      <td><img src="https://via.placeholder.com/400x250/1a1a2e/6C63FF?text=Data+Dashboard" alt="Data Dashboard" width="400"/></td>
      <td><img src="https://via.placeholder.com/400x250/1a1a2e/6C63FF?text=Quiz+Mode" alt="Quiz Mode" width="400"/></td>
    </tr>
  </table>
</div>

> **Note:** Replace placeholder images with actual screenshots of the live app.

---

## 🚀 Live Demo

Experience the simulation now:

**👉 [Launch Newton's Apple](https://sudarshandev-llm.github.io/newton-simulation-appletheory/)**

---

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm 9+ or pnpm/yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/sudarshandev-llm/newton-simulation-appletheory.git
cd newton-simulation-appletheory

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎮 Usage

### Quick Start

1. Open the app in your browser (default: `http://localhost:5173`)
2. Select a **planet** from the dropdown to set gravity
3. Adjust **drop height** using the slider (1m - 50m)
4. Toggle **air resistance** on/off for comparison
5. Add **wind force** to see trajectory changes
6. Click **"Drop Apple"** to start the simulation
7. Watch real-time **velocity, acceleration, force & distance** in the data dashboard

### Controls Reference

| Control | Function |
|---------|----------|
| 🌍 Planet Selector | Choose gravity environment |
| 📏 Height Slider | Set initial drop height |
| 🌬️ Wind Slider | Apply horizontal wind force |
| 🐌 Slow Motion | Toggle 0.1x speed mode |
| 🔄 Air Resistance | Toggle drag force |
| 📊 Data Dashboard | View live telemetry |
| 🧪 Quiz Mode | Test your knowledge |
| 🌓 Theme Toggle | Switch dark/light |

---

## 🧪 Physics Engine

The simulation uses **Matter.js** for real-time physics calculations:

```
Planet Gravity Values:
  🌙 Moon:   1.62 m/s²
  🌍 Earth:  9.81 m/s²
  🪐 Mars:   3.72 m/s²
  🟤 Jupiter: 24.79 m/s²
```

**Formulas visualized:**
- Gravitational Force: `F = G(m₁m₂)/r²`
- Velocity: `v = v₀ + at`
- Kinetic Energy: `KE = ½mv²`
- Potential Energy: `PE = mgh`

---

## 🏗️ Architecture

```
┌──────────────────────────────────────┐
│           App.jsx                    │
│   ┌──────────────────────────────┐   │
│   │   LoadingScreen.jsx          │   │
│   └──────────────────────────────┘   │
│   ┌──────────────────────────────┐   │
│   │   SimulationCanvas.jsx       │   │
│   │   ┌────────────────────┐     │   │
│   │   │  Matter.js Engine  │     │   │
│   │   └────────────────────┘     │   │
│   └──────────────────────────────┘   │
│   ┌──────────────────────────────┐   │
│   │   DataDashboard.jsx          │   │
│   └──────────────────────────────┘   │
│   ┌──────────────────────────────┐   │
│   │   PlanetSelector.jsx         │   │
│   └──────────────────────────────┘   │
│   ┌──────────────────────────────┐   │
│   │   FormulaCards.jsx           │   │
│   └──────────────────────────────┘   │
│   ┌──────────────────────────────┐   │
│   │   QuizMode.jsx               │   │
│   └──────────────────────────────┘   │
│   ┌──────────────────────────────┐   │
│   │   Footer.jsx                 │   │
│   └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite 6** | Build tool & dev server |
| **Matter.js** | 2D physics engine |
| **Framer Motion** | Animations & transitions |
| **Tailwind CSS** | Utility-first styling |
| **Recharts** | Data visualization |

---

## 🧑‍💻 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See the [open issues](https://github.com/sudarshandev-llm/newton-simulation-appletheory/issues) for feature requests and bug reports.

---

## 🗺️ Roadmap

- [ ] **Mobile responsive** — Full touch support for tablets & phones
- [ ] **More planets** — Venus, Saturn, Neptune gravity environments
- [ ] **Multi-body simulation** — Drop multiple objects simultaneously
- [ ] **Data export** — Download telemetry as CSV
- [ ] **Custom gravity** — User-defined gravity values
- [ ] **Visual graphs** — Velocity/acceleration over time charts
- [ ] **i18n** — Multi-language support (Marathi, Hindi, etc.)

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 🙏 Acknowledgements

- [Matter.js](https://brm.io/matter-js/) — 2D physics engine
- [React](https://reactjs.org/) — UI library
- [Vite](https://vitejs.dev/) — Build tooling
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Recharts](https://recharts.org/) — Charts

---

<div align="center">
  <sub>Built with ❤️ by <strong>Team Alum / Alumni AI</strong></sub>
  <br/>
  <sub>📧 sudarshan.deve@gmail.com</sub>
</div>
