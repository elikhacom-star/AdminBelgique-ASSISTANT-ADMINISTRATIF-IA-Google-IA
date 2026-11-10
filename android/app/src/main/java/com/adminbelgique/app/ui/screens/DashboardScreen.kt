package com.adminbelgique.app.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.adminbelgique.app.data.AuthRepository
import com.adminbelgique.app.model.UserRole
import com.adminbelgique.app.ui.components.RoleBadge

@Composable
fun DashboardScreen(
    authRepo: AuthRepository,
    onNavigateToRbac: () -> Unit,
    onNavigateToDocs: () -> Unit,
    modifier: Modifier = Modifier
) {
    val currentUser by authRepo.currentUser.collectAsState()
    val currentRole = currentUser?.role ?: UserRole.VISITOR

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Welcome Banner Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
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
                            text = "AdminBelgique Mobile",
                            color = Color.White,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        RoleBadge(role = currentRole)
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Session active : ${currentUser?.displayName ?: "Visiteur"}",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Solution d'assistance administrative & fiscale belge optimisée pour Android.",
                        color = Color(0xFFCBD5E1),
                        fontSize = 11.sp
                    )

                    Spacer(modifier = Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = onNavigateToDocs,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB)),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Générer Document", fontSize = 11.sp)
                        }
                        OutlinedButton(
                            onClick = onNavigateToRbac,
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Gérer Rôles (RBAC)", fontSize = 11.sp)
                        }
                    }
                }
            }
        }

        // Quick Stats Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatCard(
                    title = "Dossiers Actifs",
                    value = "24",
                    sub = "100% Conformes",
                    color = Color(0xFF10B981),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Échéance SPF",
                    value = "20 Déc.",
                    sub = "TVA / ISOC",
                    color = Color(0xFFF59E0B),
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Role Switcher Card for Test/Demo
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "Simulation Instantanée des 3 Rôles",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Basculez d'un rôle à l'autre pour tester le comportement de sécurité sur Android :",
                        color = Color(0xFF94A3B8),
                        fontSize = 11.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Button(
                            onClick = { authRepo.switchRole(UserRole.ADMIN) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (currentRole == UserRole.ADMIN) Color(0xFFD97706) else Color(0xFF334155)
                            ),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp)
                        ) {
                            Text("Admin", fontSize = 11.sp)
                        }
                        Button(
                            onClick = { authRepo.switchRole(UserRole.EDITOR) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (currentRole == UserRole.EDITOR) Color(0xFF2563EB) else Color(0xFF334155)
                            ),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp)
                        ) {
                            Text("Éditeur", fontSize = 11.sp)
                        }
                        Button(
                            onClick = { authRepo.switchRole(UserRole.VISITOR) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (currentRole == UserRole.VISITOR) Color(0xFF475569) else Color(0xFF334155)
                            ),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp)
                        ) {
                            Text("Visiteur", fontSize = 11.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(title: String, value: String, sub: String, color: Color, modifier: Modifier = Modifier) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        shape = RoundedCornerShape(12.dp),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(title, color = Color(0xFF94A3B8), fontSize = 11.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(value, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(2.dp))
            Text(sub, color = color, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}
