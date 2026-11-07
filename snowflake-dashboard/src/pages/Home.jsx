import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Sales",
      value: "—",
      description: "Your sales overview",
      icon: "₹",
    },
    {
      title: "Total Orders",
      value: "—",
      description: "Orders received",
      icon: "▤",
    },
    {
      title: "Customers",
      value: "—",
      description: "Customer overview",
      icon: "♙",
    },
    {
      title: "Products",
      value: "—",
      description: "Product catalogue",
      icon: "□",
    },
  ];

  return (
    <div className="home-page">
      <Header />

      <main className="home-content">
        <section className="home-welcome">
          <div>
            <span className="home-eyebrow">YOUR WORKSPACE</span>
            <h1>Welcome to Snowpify!</h1>
            <p>
              Here's your Snowpify workspace. Manage your business
              and explore your latest insights.
            </p>
          </div>

          <div className="home-welcome-icon">✦</div>
        </section>

        <section className="home-section">
          <div className="home-section-heading">
            <div>
              <h2>Overview</h2>
              <p>Your business at a glance</p>
            </div>
          </div>

          <div className="home-stats-grid">
            {stats.map((stat) => (
              <article className="home-stat-card" key={stat.title}>
                <div className="home-stat-top">
                  <span>{stat.title}</span>
                  <div className="home-stat-icon">{stat.icon}</div>
                </div>
                <h3>{stat.value}</h3>
                <p>{stat.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-heading">
            <div>
              <h2>Quick access</h2>
              <p>Continue where you left off</p>
            </div>
          </div>

          <div className="home-actions-grid">
            <button
              className="home-action-card"
              onClick={() => navigate("/sales")}
            >
              <span className="home-action-icon">↗</span>
              <span className="home-action-title">Sales</span>
              <span className="home-action-description">
                View and manage your sales records
              </span>
              <span className="home-action-arrow">→</span>
            </button>

            <button
              className="home-action-card"
              onClick={() => navigate("/dashboard")}
            >
              <span className="home-action-icon">▥</span>
              <span className="home-action-title">Analytics</span>
              <span className="home-action-description">
                Explore business performance
              </span>
              <span className="home-action-arrow">→</span>
            </button>
          </div>
        </section>

        <footer className="home-footer">
          <span>Snowpify</span>
          <span>Manage smarter. Grow better.</span>
        </footer>
      </main>
    </div>
  );
}

export default Home;