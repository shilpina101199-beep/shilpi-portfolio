import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WhatIDoModel from "./WhatIDoModel";

const WhatIDo = () => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };
  useEffect(() => {
    const section = document.querySelector(".whatIDO");
    const getCharacterModel = () => document.querySelector(".character-model");
    const hideCharacterModel = () =>
      getCharacterModel()?.classList.add("character-section-hidden");
    const showCharacterModel = () =>
      getCharacterModel()?.classList.remove("character-section-hidden");
    const swapTrigger = section
      ? ScrollTrigger.create({
          trigger: section,
          start: "top 70%",
          end: "bottom 5%",
          onEnter: hideCharacterModel,
          onEnterBack: hideCharacterModel,
          onLeave: showCharacterModel,
          onLeaveBack: showCharacterModel,
        })
      : null;
    if (ScrollTrigger.isTouch) {
      containerRef.current.forEach((container) => {
        if (container) {
          container.classList.remove("what-noTouch");
          container.addEventListener("click", () => handleClick(container));
        }
      });
    }
    return () => {
      swapTrigger?.kill();
      showCharacterModel();
      containerRef.current.forEach((container) => {
        if (container) {
          container.removeEventListener("click", () => handleClick(container));
        }
      });
    };
  }, []);
  return (
    <div className="whatIDO">
      <WhatIDoModel />
      <div className="what-box">
        <h2 className="title">
          W<span className="hat-h2">HAT</span>
          <div>
            I<span className="do-h2"> DO</span>
          </div>
        </h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2">
            <svg width="100%">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
              <line
                x1="100%"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
            </svg>
          </div>
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 0)}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="0"
                  x2="100%"
                  y2="0"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>

            <div className="what-content-in">
              <h3>RESEARCH</h3>
              <h4>Strategy and systems</h4>
              <p>
                I translate interviews, behavioural analytics, usability
                studies, and stakeholder workshops into design direction for
                complex products and services.
              </p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                <div className="what-tags">User Research</div>
                <div className="what-tags">Usability Testing</div>
                <div className="what-tags">Systems Thinking</div>
                <div className="what-tags">Workshops</div>
                <div className="what-tags">Behaviour Analytics</div>
                <div className="what-tags">Service Blueprints</div>
                <div className="what-tags">Accessibility</div>
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 1)}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>
            <div className="what-content-in">
              <h3>EXPERIENCE DESIGN</h3>
              <h4>Interaction and prototyping</h4>
              <p>
                I design visual systems, high-fidelity prototypes,
                micro-interactions, dashboards, and cross-form-factor interfaces
                for physical-digital products.
              </p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                <div className="what-tags">Figma</div>
                <div className="what-tags">Design Systems</div>
                <div className="what-tags">Motion Design</div>
                <div className="what-tags">Accessible Design</div>
                <div className="what-tags">HMI</div>
                <div className="what-tags">User Flows</div>
                <div className="what-tags">Blender</div>
                <div className="what-tags">Fusion 360</div>
                <div className="what-tags">Rhino</div>
                <div className="what-tags">Rapid Prototyping</div>
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);

    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");
        sibling.classList.toggle("what-sibling");
      }
    });
  }
}
