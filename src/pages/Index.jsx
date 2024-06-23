import React, { useState } from "react";
import { Container, VStack, Text, Input, Button, useToast } from "@chakra-ui/react";
import * as XLSX from "xlsx";

const Index = () => {
  const [mappingFile, setMappingFile] = useState(null);
  const [dataFile, setDataFile] = useState(null);
  const toast = useToast();

  const handleFileUpload = (e, setFile) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const processFiles = () => {
    if (!mappingFile || !dataFile) {
      toast({
        title: "Error",
        description: "Please upload both files.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const mappingData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const reader2 = new FileReader();
      reader2.onload = (e2) => {
        const data2 = new Uint8Array(e2.target.result);
        const workbook2 = XLSX.read(data2, { type: "array" });
        const sheetName2 = workbook2.SheetNames[0];
        const worksheet2 = workbook2.Sheets[sheetName2];
        const dataFileData = XLSX.utils.sheet_to_json(worksheet2, { header: 1 });

        const newHeaders = mappingData.map(row => row[0]);
        const newData = dataFileData.map(row => {
          const newRow = {};
          mappingData.forEach((mapRow, index) => {
            newRow[newHeaders[index]] = row[index];
          });
          return newRow;
        });

        const newWorksheet = XLSX.utils.json_to_sheet(newData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Processed Data");

        XLSX.writeFile(newWorkbook, "processed_data.xlsx");
      };
      reader2.readAsArrayBuffer(dataFile);
    };
    reader.readAsArrayBuffer(mappingFile);
  };

  return (
    <Container centerContent maxW="container.md" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <VStack spacing={4}>
        <Text fontSize="2xl">Upload Mapping File</Text>
        <Input type="file" accept=".xlsx, .csv" onChange={(e) => handleFileUpload(e, setMappingFile)} />
        <Text fontSize="2xl">Upload Data File</Text>
        <Input type="file" accept=".xlsx, .csv" onChange={(e) => handleFileUpload(e, setDataFile)} />
        <Button colorScheme="blue" onClick={processFiles}>Process Files</Button>
      </VStack>
    </Container>
  );
};

export default Index;