package com.adminbelgique.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.adminbelgique.app.data.AuthRepository
import com.adminbelgique.app.model.UserRole
import com.adminbelgique.app.model.permissions

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DocumentGeneratorScreen(
    authRepo: AuthRepository,
    modifier: Modifier = Modifier
) {
    val currentUser by authRepo.currentUser.collectAsState()
    val currentRole = currentUser?.role ?: UserRole.VISITOR
    val canCreateContent = currentRole.permissions().canCreateContent

    var selectedTemplate by remember { mutableStateOf("mise-en-demeure") }
    var senderName by remember { mutableStateOf("elikacces IT Solutions") }
    var recipientName by remember { mutableStateOf("Société Débitrice SPRL") }
    var amount by remember { mutableStateOf("1.500,00") }
    var invoiceRef by remember { mutableStateOf("FACT-2026-089") }

    var generatedResult by remember { mutableStateOf<String?>(null) }
    var permissionWarning by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Générateur Juridique Belge (Android)",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Modèles conformes au Code de droit économique et aux décrets régionaux belges.",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp
                    )
                }
            }
        }

        // Template Selector
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = selectedTemplate == "mise-en-demeure",
                    onClick = { selectedTemplate = "mise-en-demeure" },
                    label = { Text("Mise en Demeure", fontSize = 11.sp) }
                )
                FilterChip(
                    selected = selectedTemplate == "bail-residence",
                    onClick = { selectedTemplate = "bail-residence" },
                    label = { Text("Bail Résidence", fontSize = 11.sp) }
                )
                FilterChip(
                    selected = selectedTemplate == "indexation-loyer",
                    onClick = { selectedTemplate = "indexation-loyer" },
                    label = { Text("Index Statbel", fontSize = 11.sp) }
                )
            }
        }

        // Form Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text("Données Administratives", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)

                    OutlinedTextField(
                        value = senderName,
                        onValueChange = { senderName = it },
                        label = { Text("Expéditeur / Entreprise") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = recipientName,
                        onValueChange = { recipientName = it },
                        label = { Text("Destinataire (Débiteur / Locataire)") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = amount,
                        onValueChange = { amount = it },
                        label = { Text("Montant (€)") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = invoiceRef,
                        onValueChange = { invoiceRef = it },
                        label = { Text("Référence du document") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Permission warning banner if Visitor
                    if (!canCreateContent) {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color(0x33F59E0B)),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.border(1.dp, Color(0x66F59E0B), RoundedCornerShape(8.dp))
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(
                                    text = "Rôle Visiteur (Lecture Seule) : La génération de documents officiels requiert le rôle Éditeur ou Administrateur.",
                                    color = Color(0xFFFDE68A),
                                    fontSize = 11.sp
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Button(
                                    onClick = { authRepo.switchRole(UserRole.EDITOR) },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB)),
                                    shape = RoundedCornerShape(6.dp),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text("Activer le rôle Éditeur →", fontSize = 10.sp)
                                }
                            }
                        }
                    }

                    // Generate Button
                    Button(
                        onClick = {
                            if (!canCreateContent) {
                                permissionWarning = "Permission refusée : Connectez-vous en tant qu'Éditeur ou Administrateur pour générer ce document."
                            } else {
                                permissionWarning = null
                                generatedResult = """
                                    RECOMMANDÉ AVEC ACCUSÉ DE RÉCEPTION
                                    Expéditeur : $senderName
                                    Destinataire : $recipientName
                                    Réf : $invoiceRef - Montant dû : $amount €
                                    
                                    MISE EN DEMEURE DE PAYER (Conforme Code de droit économique belge)
                                    Par la présente, nous vous mettons formellement en demeure de régler le montant de $amount € sous un délai légal impératif de 14 jours calendrier.
                                    À défaut, le dossier sera transmis à l'huissier de justice territorialement compétent.
                                """.trimIndent()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (canCreateContent) Color(0xFF2563EB) else Color(0xFF334155)
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Description, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (canCreateContent) "Générer le Document Conforme" else "Générer (Réservé Éditeur/Admin)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // Document Preview Card
        if (generatedResult != null) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Aperçu A4 Certifié Conforme",
                                color = Color(0xFF0F172A),
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                            Text(
                                text = "ADB-${System.currentTimeMillis().toString().takeLast(6)}",
                                color = Color.Gray,
                                fontSize = 10.sp
                            )
                        }
                        Divider(modifier = Modifier.padding(vertical = 8.dp))
                        Text(
                            text = generatedResult ?: "",
                            color = Color(0xFF1E293B),
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp,
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }
    }
}
