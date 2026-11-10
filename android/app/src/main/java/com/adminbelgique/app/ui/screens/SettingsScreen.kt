package com.adminbelgique.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.adminbelgique.app.data.AuthRepository
import com.adminbelgique.app.model.UserRole
import com.adminbelgique.app.model.permissions

@Composable
fun SettingsScreen(
    authRepo: AuthRepository,
    modifier: Modifier = Modifier
) {
    val currentUser by authRepo.currentUser.collectAsState()
    val currentRole = currentUser?.role ?: UserRole.VISITOR
    val canManageSettings = currentRole.permissions().manageSettings

    var companyName by remember { mutableStateOf("elikacces IT Solutions") }
    var bceNumber by remember { mutableStateOf("0842.123.456") }
    var vatNumber by remember { mutableStateOf("BE 0842.123.456") }
    var email by remember { mutableStateOf("Elikhacom@gmail.com") }
    var address by remember { mutableStateOf("Avenue Louise 250, 1050 Bruxelles") }
    var savedMessage by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Paramètres de l'Entreprise (Android)",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Identité légale BCE, TVA et coordonnées de facturation.",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp
                    )
                }
            }
        }

        // Admin Only Notice
        if (!canManageSettings) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0x33F59E0B)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.border(1.dp, Color(0x66F59E0B), RoundedCornerShape(12.dp))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "Modification réservée aux Administrateurs (Rôle actuel : ${currentRole.label})",
                            color = Color(0xFFFDE68A),
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Les paramètres système et légaux ne peuvent être altérés par les rôles Éditeur ou Visiteur.",
                            color = Color(0xFFFEF3C7),
                            fontSize = 11.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = { authRepo.switchRole(UserRole.ADMIN) },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD97706)),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Passer en Administrateur →", fontSize = 11.sp)
                        }
                    }
                }
            }
        }

        // Form Fields
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = companyName,
                        onValueChange = { if (canManageSettings) companyName = it },
                        enabled = canManageSettings,
                        label = { Text("Dénomination") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = bceNumber,
                        onValueChange = { if (canManageSettings) bceNumber = it },
                        enabled = canManageSettings,
                        label = { Text("Numéro BCE") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = vatNumber,
                        onValueChange = { if (canManageSettings) vatNumber = it },
                        enabled = canManageSettings,
                        label = { Text("Numéro TVA") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = email,
                        onValueChange = { if (canManageSettings) email = it },
                        enabled = canManageSettings,
                        label = { Text("Email administratif") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = address,
                        onValueChange = { if (canManageSettings) address = it },
                        enabled = canManageSettings,
                        label = { Text("Siège d'exploitation") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    if (savedMessage != null) {
                        Text(savedMessage ?: "", color = Color(0xFF34D399), fontSize = 12.sp)
                    }

                    Button(
                        onClick = {
                            if (canManageSettings) {
                                savedMessage = "Paramètres enregistrés avec succès !"
                            }
                        },
                        enabled = canManageSettings,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (canManageSettings) "Enregistrer les modifications" else "Enregistrement réservé aux Administrateurs",
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }
    }
}
