import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ClassBodyCstNode, ClassBodyDeclarationCstNode, FieldDeclarationCstNode, FieldModifierCstNode, IToken, parse } from "java-parser";
import Editor from '@monaco-editor/react';

function findFieldDeclarationType(node: FieldDeclarationCstNode) {
  const unannType = node.children.unannType[0];
  const { unannReferenceType, unannPrimitiveTypeWithOptionalDimsSuffix } =
    unannType.children;
  if (unannReferenceType) {
    return unannReferenceType[0].children.unannClassOrInterfaceType[0].children
      .unannClassType[0].children.Identifier[0].image;
  } else if (unannPrimitiveTypeWithOptionalDimsSuffix) {
    const { numericType, Boolean } =
      unannPrimitiveTypeWithOptionalDimsSuffix[0].children.unannPrimitiveType[0]
        .children;
    if (numericType) {
      const { integralType, floatingPointType } = numericType[0].children;
      if (integralType) {
        const { Byte, Char, Short, Int, Long } = integralType[0].children;
        const t: IToken[] | undefined = Byte || Char || Short || Int || Long;
        if (t) {
          return t[0].image;
        }
      } else if (floatingPointType) {
        const { Double, Float } = floatingPointType[0].children;
        const t: IToken[] | undefined = Double || Float;
        if (t) {
          return t[0].image;
        }
      }
    }
  }
  return null;
}

function findFieldDeclarationName(node: FieldDeclarationCstNode) {
  if (node.children.variableDeclaratorList) {
    const varDecl =
      node.children.variableDeclaratorList[0].children.variableDeclarator[0];
    if (varDecl.children.variableDeclaratorId) {
      const varId = varDecl.children.variableDeclaratorId[0];
      if (varId.children.Identifier) {
        return varId.children.Identifier[0].image;
      }
    }
  }
  return null;
}

function findFieldDeclarationModifier(node: FieldDeclarationCstNode) {
  if (node.children.fieldModifier) {
    for (const i of node.children.fieldModifier) {
      const m = i.children.Private
        || i.children.Protected
        || i.children.Public
      if (m) {
        return m[0].image
      }
    }
  }
  return null
}

function formatComment(text: string | undefined) {
  if (!text) return '';
  // 只处理 javadoc 注释
  if (text.startsWith('/**')) {
    return text
      .replace(/^\/\*\*/,'') // 去掉开头 /**
      .replace(/\*\/$/,'')    // 去掉结尾 */
      .split('\n')
      .map(line => line.replace(/^\s*\* ?/, '').trim()) // 去掉每行开头的 *
      .join(' ')
      .trim();
  }
  return text.trim();
}

function findField(node: ClassBodyDeclarationCstNode) {
  const f = node.children.classMemberDeclaration?.[0].children.fieldDeclaration?.[0]
  if (f) {
    const type = findFieldDeclarationType(f);
    const name = findFieldDeclarationName(f);
    const modifier = findFieldDeclarationModifier(f);
    const comment = formatComment(node.leadingComments?.[0].image)
    return {type, name, modifier, comment}
  }
  return null
}

function findFields(node: any, output: any[]) {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((child) => findFields(child, output));
    return;
  }
  if (node.name === "classBodyDeclaration") {
    const f = findField(node)
    if (f) {
      output.push(f);
    }
  } else if (node.children) {
    Object.values(node.children).forEach((child) => findFields(child, output));
  }
}

function parseJavaFields(javaCode: string) {
  const cst = parse(javaCode);
  const fields: { name: string; type: string; comment: string, modifier: string }[] = [];
  findFields(cst, fields);
  return fields.map((f, id) => ({ ...f, id }));
}

const columns: GridColDef[] = [
  { field: "modifier", headerName: "修饰符", width: 150 },
  { field: "name", headerName: "字段名", width: 150 },
  { field: "type", headerName: "类型", width: 150 },
  { field: "comment", headerName: "注释", width: 300 },
];

const JavaToTable: React.FC = () => {
  const [javaCode, setJavaCode] = useState("");
  const [rows, setRows] = useState<any[]>([]);

  const handleParse = () => {
    setRows(parseJavaFields(javaCode));
  };

  const handleCopyToExcel = () => {
    const headers = columns.map((col) => col.headerName).join("\t");
    const dataRows = rows
      .map((row) => columns.map((col) => row[col.field]).join("\t"))
      .join("\n");
    const excelData = `${headers}\n${dataRows}`;
    navigator.clipboard.writeText(excelData).then(() => {
      alert("数据已复制到剪贴板，请粘贴到 Excel 中");
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Java转表格工具</Typography>
      <Box sx={{ display: 'flex', gap: 2, height: '70vh' }}>
        <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden', mb: 2, p: 1 }}>
            <Editor
              height="100%"
              defaultLanguage="java"
              value={javaCode}
              onChange={v => setJavaCode(v || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleParse}>解析</Button>
            <Button variant="outlined" onClick={handleCopyToExcel} disabled={rows.length === 0}>复制到Excel</Button>
          </Box>
        </Paper>
        <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight={false}
            sx={{ flex: 1 }}
            hideFooter
            disableRowSelectionOnClick
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default JavaToTable;
