import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>MSc/MA Innovation Design Engineering</h4>
                <h5>Imperial College London / Royal College of Art</h5>
              </div>
              <h3>2025-27</h3>
            </div>
            <p>
              Studying human-computer interaction through the IDE double
              masters, exploring physical-digital systems, multimodal
              interaction, and design-led innovation.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Experience Designer</h4>
                <h5>Bosch ADAS</h5>
              </div>
              <h3>2023-25</h3>
            </div>
            <p>
              Unified camera, radar, and LiDAR signals into one in-vehicle
              hardware interface, mapped 50+ ADAS functions into service
              blueprints, and designed dashboards for compute and ML workflows.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>UX Designer</h4>
                <h5>Honeywell Forge</h5>
              </div>
              <h3>2022-23</h3>
            </div>
            <p>
              Designed worker-assist and sustainability experiences across HMT
              hardware and desktop, including shared visual annotation systems
              and operator-focused sustainability dashboards.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Experience Design Researcher</h4>
                <h5>Publicis Sapient</h5>
              </div>
              <h3>2021-22</h3>
            </div>
            <p>
              Reframed digital workflow redesigns across B2B and B2C platforms
              by combining interviews, usability studies, and behavioural
              analytics to surface evidence-led product decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
