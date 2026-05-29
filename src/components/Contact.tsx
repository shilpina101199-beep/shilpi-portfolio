import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Email</h4>
            <p>
              <a href="mailto:shilpi.shilpi25@imperial.ac.uk" data-cursor="disable">
                shilpi.shilpi25@imperial.ac.uk
              </a>
            </p>
            <h4>Phone</h4>
            <p>
              <a href="tel:+447392414623" data-cursor="disable">
                +44 7392 414623
              </a>
            </p>
          </div>
          <div className="contact-box">
            <h4>Social</h4>
            <a
              href="https://shilpi99.framer.website"
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Portfolio <MdArrowOutward />
            </a>
            <a
              href="https://www.linkedin.com/in/shilpi"
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Linkedin <MdArrowOutward />
            </a>
            <a
              href="/Shilpi_Resume_Design_Intern_RCA.pdf"
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Resume <MdArrowOutward />
            </a>
            <a
              href="mailto:shilpi.shilpi25@imperial.ac.uk"
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Email <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <h2>
              Innovation Design <br /> by <span>Shilpi</span>
            </h2>
            <h5>
              <MdCopyright /> 2024
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
