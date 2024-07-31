import React, { useState, useCallback, useRef } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import "./App.css";
import img1 from "../src/Assets/Blue and Yellow Minimalist Employee of the Month Certificate.png";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { GrView } from "react-icons/gr";
import QRCode from "qrcode.react";
function App() {
  const [data, setData] = useState([]);
  const refs = useRef([]);
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const[doc,setDoc]=useState();
  const onButtonClick = useCallback(async (item) => {
    if (!refs.current[item]) {
      return;
    }
    try {
      const dataUrl = await toPng(refs.current[item], { cacheBust: true });
      const doc = new jsPDF();
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        doc.addImage(img, "PNG", 15, 30, 180, 0); // Adjust x, y, width, height as needed
        doc.save(`${item?.NAME}.pdf`);
      };
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet);

      setData(sheetData);
    };

    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const heading = [["Name", "Gender", "Age", "Country"]];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([], { header: heading[0] });
    XLSX.utils.sheet_add_aoa(ws, heading, { origin: "A1" });
    XLSX.utils.sheet_add_json(ws, data, { origin: "A2", skipHeader: true });
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "Report.xlsx");
  };
 
  return (
    <div className="container">
      <div className="row">
        <div className="mb-3 col-md-6">
          <input
            className="form-control col-md-6"
            type="file"
            id="formFile"
            onChange={handleImport}
          />
        </div>
        <div className="col-auto">
          <button
            type="submit"
            className="btn btn-primary mb-3"
            onClick={handleExport}
          >
            Export File
          </button>
        </div>
      </div>
      <div>
        <table className="table table-striped">
          <thead>
            <tr>
              <td>Name</td>
              <td>Gender</td>
              <td>Age</td>
              <td>Country</td>
              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            {data?.slice(0, 10).map((item, index) => (
              <tr key={index}>
                <td>{item?.NAME}</td>
                <td>{item?.GENDER}</td>
                <td>{item?.AGE}</td>
                <td>{item?.COUNTRY}</td>
                <td onClick={()=>{toggle();setDoc(item)}} className="cursor-pointer"><GrView color="red" className="cursor-pointer"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={modal} toggle={toggle} className="d-flex justify-center" size="lg">
        <ModalHeader toggle={toggle}>Certificate Modal </ModalHeader>
        <ModalBody>
        <div className="row">
       
         
            <div className="position-relative d-flex justify-content-center" ref={(el) => (refs.current[doc] = el)}>
              <img src={img1} height={400} width={600} alt="img not found" />
              <div>
              <p className="image-name mb-0">{doc?.NAME}</p>
              </div>
              
            </div>
            
            <div className="qr-code">
            
      </div>
       
      </div>
        </ModalBody>
        <ModalFooter>
       
        <Button color="danger" onClick={() => onButtonClick(doc)}>
        Download PDF {doc?.NAME}
        </Button>
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
     
    </div>
  );
}

export default App;
