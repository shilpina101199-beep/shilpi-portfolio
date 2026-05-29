import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const projects = [
  {
    title: "Art as an Emotion",
    category: "Multimodal Interaction / Gen AI",
    tools: "HAI, Accessible Design, Community Platform, AI Prompts",
  },
  {
    title: "Meadow Mobile App",
    category: "Art Therapy Experience",
    tools: "Gesture, Motion, Facial Expression, Audio Input",
  },
  {
    title: "R-P-S TOSSLY",
    category: "Cyber Physical Systems",
    tools: "Python, Machine Learning, Servo Motors, Physical Prototyping",
  },
  {
    title: "ADAS Interface",
    category: "In-Vehicle Systems Design",
    tools: "Camera, Radar, LiDAR, Visual Hierarchy, HMI",
  },
  {
    title: "Worker Assist",
    category: "HMT / Remote Expert UX",
    tools: "Multimodal Interaction, Annotation, Cross-Platform Design",
  },
  {
    title: "Sustainability+",
    category: "Operational Dashboard",
    tools: "Data Visualisation, Decision Metrics, Design Systems",
  },
];

const Work = () => {
  useGSAP(() => {
  const workFlex = document.querySelector(".work-flex") as HTMLElement | null;
  const workContainer = document.querySelector(
    ".work-container"
  ) as HTMLElement | null;

  if (!workFlex || !workContainer) return;

  const getTranslateX = () => {
    const boxes = Array.from(
      document.getElementsByClassName("work-box")
    ) as HTMLElement[];
    if (!boxes.length) return 0;

    const totalWidth = boxes.reduce(
      (width, box) => width + box.getBoundingClientRect().width,
      0
    );
    const flexStyle = window.getComputedStyle(workFlex);
    const startOffset = Math.abs(parseFloat(flexStyle.marginLeft) || 0);
    const endPadding = parseFloat(flexStyle.paddingRight) || 0;

    const distance = Math.max(
      0,
      totalWidth + startOffset + endPadding - workContainer.clientWidth
    );

    return Math.min(distance, window.innerHeight * 1.35);
  };

  let timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".work-section",
      start: "top top",
      end: () => `+=${getTranslateX()}`,
      scrub: true,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      fastScrollEnd: true,
      invalidateOnRefresh: true,
      id: "work",
    },
  });

  timeline.to(".work-flex", {
    x: () => -getTranslateX(),
    ease: "none",
  });

  requestAnimationFrame(() => ScrollTrigger.refresh());

  // Clean up (optional, good practice)
  return () => {
    timeline.kill();
    ScrollTrigger.getById("work")?.kill();
  };
}, []);
  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {projects.map((project, index) => (
            <div className="work-box" key={index}>
              <div className="work-info">
                <div className="work-title">
                  <h3>0{index + 1}</h3>

                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{project.tools}</p>
              </div>
              <WorkImage image="/images/placeholder.webp" alt="" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
