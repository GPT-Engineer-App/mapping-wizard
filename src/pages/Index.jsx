import React, { useState } from "react";
import { Container, VStack, Text, Input, Button, useToast, Select, Heading } from "@chakra-ui/react";
import * as XLSX from "xlsx";

const Index = () => {
  const [mappingFile, setMappingFile] = useState(null);
  const [dataFile, setDataFile] = useState(null);
  const [template, setTemplate] = useState("");
  const toast = useToast();

  const handleFileUpload = (e, setFile) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const processFiles = () => {
    if (!dataFile || !template) {
      toast({
        title: "Error",
        description: "Please upload the data file and select a template.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const templateMapping = {
      "Target.com": {
        "Package Depth": "BOX 1 DEPTH (IN)",
        "Package Height": "BOX 1 HEIGHT (IN)",
        "Package Weight": "BOX 1 WEIGHT (LBS.)",
        "Package Width": "BOX 1 WIDTH (IN)",
        "Brand": "BRAND NAME",
        "Bullet Feature 1": "Bullet Point 1",
        "Bullet Feature 14": "Bullet Point 14",
        "Bullet Feature 2": "Bullet Point 2",
        "Bullet Feature 3": "Bullet Point 3",
        "Bullet Feature 4": "Bullet Point 4",
        "Bullet Feature 5": "Bullet Point 5",
        "Bullet Feature 6": "Bullet Point 6",
        "Partner SKU": "CENPORTS (SKU)",
        "Color Family": "FINISH/COLOR",
        "Additional Image 1": "IMAGE 1",
        "Additional Image 10": "IMAGE 10",
        "Additional Image 11": "IMAGE 11",
        "Additional Image 12": "IMAGE 12",
        "Additional Image 13": "IMAGE 13",
        "Additional Image 14": "IMAGE 14",
        "Additional Image 15": "IMAGE 15",
        "Additional Image 2": "IMAGE 2",
        "Additional Image 3": "IMAGE 3",
        "Additional Image 4": "IMAGE 4",
        "Additional Image 5": "IMAGE 5",
        "Additional Image 6": "IMAGE 6",
        "Additional Image 7": "IMAGE 7",
        "Additional Image 8": "IMAGE 8",
        "Additional Image 9": "IMAGE 9",
        "Description": "MAIN DESCRIPTION",
        "Product Depth": "PRODUCT DEPTH (IN)",
        "Product Height": "PRODUCT HEIGHT (IN)",
        "Product Title": "PRODUCT TITLE",
        "Product Weight": "PRODUCT WEIGHT (LBS.)",
        "Product Width": "PRODUCT WIDTH (IN)",
        "Import Description": "Imported"
      }
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const dataFileData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const newHeaders = Object.keys(templateMapping[template]);
      const headerStyle = {
        fill: { fgColor: { rgb: "FFFF0000" } }, // Red fill
        font: { bold: true } // Bold font
      };
      const newData = dataFileData.map((row, rowIndex) => {
        if (rowIndex === 0) {
          return newHeaders.map(header => ({ v: header, s: headerStyle }));
        }
        const newRow = newHeaders.map(header => {
          const column = templateMapping[template][header];
          return row[dataFileData[0].indexOf(column)] || (header === "Import Description" ? "Imported" : "");
        });
        return newRow;
      });

      const newWorksheet = XLSX.utils.aoa_to_sheet(newData);
      newWorksheet["!cols"] = newHeaders.map(() => ({ wch: 20 })); // Optional: Set column width

      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Processed Data");

      XLSX.writeFile(newWorkbook, "processed_data.xlsx");
    };
    reader.readAsArrayBuffer(dataFile);
  };

  return (
    <Container centerContent maxW="container.md" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <VStack spacing={4}>
        <Heading as="h1" size="xl" color="red.500" fontWeight="bold">Select Template</Heading>
        <Select placeholder="Select template" onChange={(e) => setTemplate(e.target.value)}>
          <option value="Target.com">Target.com</option>
        </Select>
        <Text fontSize="2xl">Upload Data File</Text>
        <Input type="file" accept=".xlsx, .csv" onChange={(e) => handleFileUpload(e, setDataFile)} />
        <Button colorScheme="blue" onClick={processFiles}>Process Files</Button>
      </VStack>
    </Container>
  );
};

export default Index;