import React, { useState } from "react";
import { Box, Container, Paper, Typography, Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ClassBodyCstNode, ClassBodyDeclarationCstNode, FieldDeclarationCstNode, FieldModifierCstNode, IToken, parse } from "java-parser";
import Editor from '@monaco-editor/react';
import TopNav from '../src/TopNav';

function findFieldDeclarationType(node: FieldDeclarationCstNode) {
  const unannType = node.children.unannType[0];
  const { unannReferenceType, unannPrimitiveTypeWithOptionalDimsSuffix } = unannType.children;
  if (unannReferenceType) {
    return unannReferenceType[0].children.unannClassOrInterfaceType[0].children
      .unannClassType[0].children.Identifier[0].image;
  } else if (unannPrimitiveTypeWithOptionalDimsSuffix) {
    const { numericType, Boolean } = unannPrimitiveTypeWithOptionalDimsSuffix[0].children.unannPrimitiveType[0]
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
    } else if (Boolean) {
      return Boolean[0].image;
    }
  }
  return null;
}

function findFieldDeclarationName(node: FieldDeclarationCstNode) {
  if (node.children.variableDeclaratorList) {
    const varDecl = node.children.variableDeclaratorList[0].children.variableDeclarator[0];
    if (varDecl.children.variableDeclaratorId) {
      const varId = varDecl.children.variableDeclaratorId[0];
      return varId.children.Identifier?.[0]?.image || null;
    }
  }
  return null;
}

function findFieldDeclarationModifiers(node: FieldDeclarationCstNode) {
  if (node.children.fieldModifier) {
    const modifiers = node.children.fieldModifier.map((mod: FieldModifierCstNode) => {
      if (mod.children.Public) return "public";
      if (mod.children.Private) return "private";
      if (mod.children.Protected) return "protected";
      if (mod.children.Static) return "static";
      if (mod.children.Final) return "final";
      if (mod.children.Volatile) return "volatile";
      if (mod.children.Transient) return "transient";
      return null;
    }).filter(Boolean);
    return modifiers;
  }
  return [];
}

function findFieldDeclarationDocs(node: any) {
  if (node.children && (node.children as any).normalClassBodyDeclaration && (node.children as any).normalClassBodyDeclaration[0]?.children?.classMemberDeclaration && (node.children as any).normalClassBodyDeclaration[0]?.children?.classMemberDeclaration[0]?.children?.fieldDeclaration) {
    const fieldDecl = (node.children as any).normalClassBodyDeclaration[0].children.classMemberDeclaration[0].children.fieldDeclaration[0];
    if (node.children.javadocComment) {
      const javadoc = node.children.javadocComment[0].image;
      return javadoc.replace(/\/\*\*|\*\/|^\s*\*\s?/gm, '').trim();
    }
  }
  return "";
}

function JavaToTable() {
  const [javaData, setJavaData] = useState<any[]>([]);
  const [columns] = useState<GridColDef[]>([
    { field: 'modifiers', headerName: '修饰符', width: 120 },
    { field: 'type', headerName: '类型', width: 150 },
    { field: 'name', headerName: '变量名', width: 150 },
    { field: 'description', headerName: '描述', width: 400 },
  ]);

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    
    try {
      const cst = parse(value) as any;
      const classDeclaration = (cst.children.compilationUnit[0].children.typeDeclaration[0].children as any).classDeclaration[0];
      const classBody = classDeclaration.children.classBody[0] as ClassBodyCstNode;
      
      const fields = (classBody.children.classBodyDeclaration?.map((decl: any, index) => {
        if ((decl.children as any).normalClassBodyDeclaration && (decl.children as any).normalClassBodyDeclaration[0].children.classMemberDeclaration && (decl.children as any).normalClassBodyDeclaration[0].children.classMemberDeclaration[0].children.fieldDeclaration) {
          const fieldDecl = (decl.children as any).normalClassBodyDeclaration[0].children.classMemberDeclaration[0].children.fieldDeclaration[0] as FieldDeclarationCstNode;
          const type = findFieldDeclarationType(fieldDecl);
          const name = findFieldDeclarationName(fieldDecl);
          const modifiers = findFieldDeclarationModifiers(fieldDecl);
          const description = findFieldDeclarationDocs(decl);
          
          return {
            id: index,
            modifiers: modifiers.join(' '),
            type: type || '',
            name: name || '',
            description: description || '',
          };
        }
        return null;
      }) || []).filter(Boolean);
      
      setJavaData(fields as any[]);
    } catch (error) {
      console.error('Java 解析错误:', error);
    }
  };

  const handleCopyToExcel = () => {
    const headers = columns.map(col => col.headerName).join('\t');
    const rows = javaData.map(row => 
      columns.map(col => row[col.field]).join('\t')
    ).join('\n');
    const excelData = `${headers}\n${rows}`;
    
    navigator.clipboard.writeText(excelData).then(() => {
      alert('数据已复制到剪贴板，请粘贴到 Excel 中');
    });
  };

  return (
    <div>
      <TopNav />
      <div style={{ marginTop: 60 }}>
        <Container maxWidth="xl">
          <Typography variant="h4" gutterBottom>
            Java 类转表格
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 150px)' }}>
            <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              <Typography variant="h6" gutterBottom>
                Java 类编辑器
              </Typography>
              <Box sx={{ flex: 1, border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden', mb: 2, p: 1 }}>
                <Editor
                  height="100%"
                  defaultLanguage="java"
                  defaultValue='public class Example {\n    private String name;\n    private int age;\n    private boolean active;\n}'
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                  }}
                />
              </Box>
            </Paper>
            <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                解析结果
                <Button
                  variant="contained"
                  onClick={handleCopyToExcel}
                  disabled={javaData.length === 0}
                >
                  复制到 Excel
                </Button>
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <DataGrid
                  rows={javaData}
                  columns={columns}
                  hideFooter
                  disableRowSelectionOnClick
                />
              </Box>
            </Paper>
          </Box>
        </Container>
      </div>
    </div>
  );
}

export default JavaToTable;