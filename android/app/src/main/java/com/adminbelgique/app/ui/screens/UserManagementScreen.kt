package com.adminbelgique.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.adminbelgique.app.model.AppUser
import com.adminbelgique.app.model.AuditLog
import com.adminbelgique.app.model.UserRole
import com.adminbelgique.app.model.permissions
import com.adminbelgique.app.ui.components.RoleBadge

@Composable
fun UserManagementScreen(
    authRepo: AuthRepository,
    modifier: Modifier = Modifier
) {
    val currentUser by authRepo.currentUser.collectAsState()
    val currentRole = currentUser?.role ?: UserRole.VISITOR
    val canManageUsers = currentRole.permissions().manageUsers

    var usersList by remember {
        mutableStateOf(
            listOf(
                AuthRepository.PRESET_ADMIN,
                AuthRepository.PRESET_EDITOR,
                AuthRepository.PRESET_VISITOR,
                AppUser(
                    uid = "usr-004",
                    email = "jean.dupont@immoconsult.be",
                    displayName = "Jean Dupont",
                    role = UserRole.EDITOR,
                    status = "active",
                    company = "ImmoConsult Wallonie",
                    createdAt = "02/08/2026"
                )
            )
        )
    }

    var auditLogs by remember {
        mutableStateOf(
            listOf(
                AuditLog(
                    id = "log-1",
                    timestamp = "09/11/2026 09:15",
                    actorEmail = "admin@adminbelgique.com",
                    actorRole = "admin",
                    action = "ROLE_CHANGED",
                    details = "Attribution rôle Éditeur à jean.dupont@immoconsult.be"
                ),
                AuditLog(
                    id = "log-2",
                    timestamp = "09/11/2026 08:30",
                    actorEmail = "admin@adminbelgique.com",
                    actorRole = "admin",
                    action = "SESSION_LOGIN",
                    details = "Connexion sécurisée réussie sur Android"
                )
            )
        )
    }

    var searchQuery by remember { mutableStateOf("") }
    var selectedUserForRoleChange by remember { mutableStateOf<AppUser?>(null) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Header Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = null,
                            tint = Color(0xFFF59E0B),
                            modifier = Modifier.size(24.dp)
                        )
                        Text(
                            text = "Gestion RBAC & Rôles (Android)",
                            color = Color.White,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Contrôle d'accès strict sur le mobile : Administrateur, Éditeur et Visiteur.",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp
                    )
                }
            }
        }

        // 2. Permission Warning if not Admin
        if (!canManageUsers) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0x33F59E0B)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.border(1.dp, Color(0x66F59E0B), RoundedCornerShape(12.dp))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                tint = Color(0xFFF59E0B),
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Mode Consultation (${currentRole.label})",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Le rôle actuel est restreint. Seul l'Administrateur peut modifier les rôles et suspendre des comptes.",
                            color = Color(0xFFFDE68A),
                            fontSize = 11.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = { authRepo.switchRole(UserRole.ADMIN) },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD97706)),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text("Passer en Administrateur (Test 1 Clic)", fontSize = 11.sp)
                        }
                    }
                }
            }
        }

        // 3. Permissions Matrix Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "Matrice des Permissions Android & Back-end",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    PermissionRow("Back-end : Utilisateurs", admin = "Oui", editor = "Non (403)", visitor = "Non (403)")
                    PermissionRow("Back-end : Contenu & Baux", admin = "Oui", editor = "Oui", visitor = "Lecture seule")
                    PermissionRow("Back-end : Paramètres BCE", admin = "Oui", editor = "Lecture", visitor = "Non (403)")
                    PermissionRow("Front-end : Visualisation", admin = "Total", editor = "Total", visitor = "Restreint")
                    PermissionRow("Front-end : Modification", admin = "Actif", editor = "Actif", visitor = "Désactivé")
                }
            }
        }

        // 4. Users List Header & Search
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Utilisateurs (${usersList.size})",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }
        }

        // User items
        val filtered = usersList.filter {
            it.displayName.contains(searchQuery, ignoreCase = true) ||
            it.email.contains(searchQuery, ignoreCase = true)
        }

        items(filtered) { user ->
            UserCard(
                user = user,
                canManage = canManageUsers,
                onRoleClick = { selectedUserForRoleChange = user },
                onToggleStatus = {
                    usersList = usersList.map {
                        if (it.uid == user.uid) it.copy(status = if (it.status == "active") "suspended" else "active")
                        else it
                    }
                },
                onDelete = {
                    usersList = usersList.filter { it.uid != user.uid }
                    auditLogs = listOf(
                        AuditLog(
                            id = "log-${System.currentTimeMillis()}",
                            timestamp = "À l'instant",
                            actorEmail = currentUser?.email ?: "admin",
                            actorRole = currentRole.roleKey,
                            action = "USER_DELETED",
                            details = "Suppression de l'utilisateur ${user.email}"
                        )
                    ) + auditLogs
                }
            )
        }

        // 5. Security Audit Log
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "Journal d'Audit de Sécurité Android",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    auditLogs.forEach { log ->
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .background(Color(0xFF0F172A), RoundedCornerShape(8.dp))
                                .padding(10.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(log.timestamp, color = Color(0xFF64748B), fontSize = 10.sp)
                                Text(log.action, color = Color(0xFF38BDF8), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            }
                            Text(log.details, color = Color(0xFFCBD5E1), fontSize = 11.sp)
                        }
                    }
                }
            }
        }
    }

    // Role Selection Dialog for Admin
    if (selectedUserForRoleChange != null) {
        val target = selectedUserForRoleChange!!
        AlertDialog(
            onDismissRequest = { selectedUserForRoleChange = null },
            title = { Text("Modifier le Rôle de ${target.displayName}") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    UserRole.entries.forEach { roleOption ->
                        Button(
                            onClick = {
                                usersList = usersList.map {
                                    if (it.uid == target.uid) it.copy(role = roleOption)
                                    else it
                                }
                                auditLogs = listOf(
                                    AuditLog(
                                        id = "log-${System.currentTimeMillis()}",
                                        timestamp = "À l'instant",
                                        actorEmail = currentUser?.email ?: "admin",
                                        actorRole = currentRole.roleKey,
                                        action = "ROLE_CHANGED",
                                        details = "Rôle de ${target.email} modifié vers ${roleOption.label}"
                                    )
                                ) + auditLogs
                                selectedUserForRoleChange = null
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (target.role == roleOption) Color(0xFF2563EB) else Color(0xFF334155)
                            ),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(roleOption.label)
                        }
                    }
                }
            },
            confirmButton = {},
            dismissButton = {
                TextButton(onClick = { selectedUserForRoleChange = null }) {
                    Text("Fermer")
                }
            }
        )
    }
}

@Composable
fun UserCard(
    user: AppUser,
    canManage: Boolean,
    onRoleClick: () -> Unit,
    onToggleStatus: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(user.displayName, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text(user.email, color = Color(0xFF94A3B8), fontSize = 11.sp)
                }
                RoleBadge(role = user.role)
            }

            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (user.status == "active") "Compte Actif" else "Suspendu",
                    color = if (user.status == "active") Color(0xFF34D399) else Color(0xFFF87171),
                    fontSize = 10.sp
                )

                if (canManage) {
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        IconButton(onClick = onRoleClick, modifier = Modifier.size(28.dp)) {
                            Icon(Icons.Default.Edit, contentDescription = "Rôle", tint = Color(0xFF38BDF8), modifier = Modifier.size(16.dp))
                        }
                        IconButton(onClick = onToggleStatus, modifier = Modifier.size(28.dp)) {
                            Icon(Icons.Default.Block, contentDescription = "Statut", tint = Color(0xFFF59E0B), modifier = Modifier.size(16.dp))
                        }
                        IconButton(onClick = onDelete, modifier = Modifier.size(28.dp)) {
                            Icon(Icons.Default.Delete, contentDescription = "Supprimer", tint = Color(0xFFEF4444), modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PermissionRow(section: String, admin: String, editor: String, visitor: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(section, color = Color(0xFFCBD5E1), fontSize = 11.sp, modifier = Modifier.weight(1.5f))
        Text(admin, color = Color(0xFF10B981), fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
        Text(editor, color = Color(0xFF38BDF8), fontSize = 10.sp, modifier = Modifier.weight(1f))
        Text(visitor, color = Color(0xFF94A3B8), fontSize = 10.sp, modifier = Modifier.weight(1f))
    }
}
