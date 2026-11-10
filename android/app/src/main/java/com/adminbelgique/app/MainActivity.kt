package com.adminbelgique.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.adminbelgique.app.data.AuthRepository
import com.adminbelgique.app.model.UserRole
import com.adminbelgique.app.ui.components.RoleBadge
import com.adminbelgique.app.ui.screens.DashboardScreen
import com.adminbelgique.app.ui.screens.DocumentGeneratorScreen
import com.adminbelgique.app.ui.screens.SettingsScreen
import com.adminbelgique.app.ui.screens.UserManagementScreen

class MainActivity : ComponentActivity() {
    private val authRepo = AuthRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AdminBelgiqueApp(authRepo = authRepo)
        }
    }
}

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Dashboard : Screen("dashboard", "Accueil", Icons.Default.Dashboard)
    object Rbac : Screen("rbac", "Rôles RBAC", Icons.Default.Shield)
    object Documents : Screen("documents", "Documents", Icons.Default.Description)
    object Settings : Screen("settings", "Paramètres", Icons.Default.Settings)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminBelgiqueApp(authRepo: AuthRepository) {
    var currentScreen by remember { mutableStateOf<Screen>(Screen.Dashboard) }
    val currentUser by authRepo.currentUser.collectAsState()
    val currentRole = currentUser?.role ?: UserRole.VISITOR

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(end = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
                    ) {
                        Text(
                            text = "AdminBelgique",
                            color = Color.White,
                            fontSize = 17.sp,
                            fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                        )
                        RoleBadge(role = currentRole)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0F172A)
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF1E293B),
                contentColor = Color.White
            ) {
                val screens = listOf(Screen.Dashboard, Screen.Rbac, Screen.Documents, Screen.Settings)
                screens.forEach { screen ->
                    NavigationBarItem(
                        selected = currentScreen == screen,
                        onClick = { currentScreen = screen },
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title, fontSize = 10.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFF38BDF8),
                            selectedTextColor = Color(0xFF38BDF8),
                            unselectedIconColor = Color(0xFF64748B),
                            unselectedTextColor = Color(0xFF64748B),
                            indicatorColor = Color(0xFF334155)
                        )
                    )
                }
            }
        },
        containerColor = Color(0xFF0F172A)
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            when (currentScreen) {
                Screen.Dashboard -> DashboardScreen(
                    authRepo = authRepo,
                    onNavigateToRbac = { currentScreen = Screen.Rbac },
                    onNavigateToDocs = { currentScreen = Screen.Documents }
                )
                Screen.Rbac -> UserManagementScreen(authRepo = authRepo)
                Screen.Documents -> DocumentGeneratorScreen(authRepo = authRepo)
                Screen.Settings -> SettingsScreen(authRepo = authRepo)
            }
        }
    }
}
