import { Routes } from '@angular/router';
import { loginGuard } from '../guard/login.guard';
import { routeGuard } from '../guard/routeGuard';

export const routes: Routes = [
    {
        path: '',
        canActivate: [loginGuard],
        loadComponent: () =>
            import('src/app/features/auth/auth.component').then(c => c.AuthComponent)
    },
    {
        path: 'asistencia',
        loadComponent: () =>
            import('src/app/features/dashboard/module-2/asistencia/assistance.component').then(c => c.AssistanceComponent)
    },
    {
        path: 'dashboard',
        canActivate: [routeGuard],
        loadComponent: () =>
            import('src/app/features/dashboard/dashboard.component').then(c => c.DashboardComponent),
        children: [
            {
                path: 'resguardo',
                loadComponent: () =>
                    import('src/app/features/dashboard/module-1/voucher_guard/voucher_guard..component').then(c => c.VoucherGuardComponent),
            },
            {
                path: 'asignar-resguardo/:id',
                loadComponent: () =>
                    import('src/app/features/dashboard/module-1/voucher_guard/assign_guard/assign_guard.component').then(C => C.VoucherGuardAssignComponent)
            },
            {
                path: 'vehiculos-maquinaria',
                loadComponent: () =>
                    import('src/app/features/dashboard/module-1/vehicles-maquinaria/Vehicles-Maquinaria.component').then(c => c.VehicleMaquinariaComponent)
            },
            {
                path: 'vehiculo/:id',
                loadComponent: () =>
                    import('src/app/features/dashboard/module-1/vehicles-maquinaria/vehicleInformation/vehicle.info.component').then(c => c.TableVehicleMaquinariaComponent)
            },
            {
                path: 'usuario',
                loadComponent: () =>
                    import('src/app/features/dashboard/user/user.component').then(c => c.UserComponent)
            },
            {
                path: 'usuarios',
                loadComponent: () =>
                    import('src/app/features/dashboard/users/users.component').then(c => c.UsersComponent)
            },
            {
                path: 'empleados',
                loadComponent: () =>
                    import('src/app/features/dashboard/employed/employed.component').then(c => c.EmployedComponent)
            },
            {
                path: 'compras',
                loadComponent: () =>
                    import('src/app/features/dashboard/module-1/shopping/shopping.component').then(c => c.ShoppingComponent),
                children: [
                    {
                        path: 'requisiciones',
                        loadComponent: () =>
                            import('src/app/features/dashboard/module-1/shopping/view-requisitons-full/view.requisitions.component').then(c => c.ViewRequisitionsComponent)
                    },
                    {
                        path: 'asignar-vale/:id',
                        loadComponent: () =>
                            import('src/app/features/dashboard/module-1/shopping/assign-voucher/assign.voucher.component').then(c => c.AssignVoucherComponent)
                    },
                    {
                        path: 'seguimiento/:id',
                        loadComponent: () =>
                            import('src/app/features/dashboard/module-1/shopping/follow-up/follow-up.component').then(c => c.FollowUpComponenet)
                    },
                    {
                        path: 'historial',
                        loadComponent: () =>
                            import('src/app/features/dashboard/module-1/shopping/history/history-requisition.component').then(c => c.HistoryRequisitionsComponent)
                    }
                ]
            },
            {
                path: 'requisicion',
                loadComponent: () =>
                    import('src/app/features/dashboard/module-1/shopping/requisition/requisition.component').then(c => c.RequisitionComponent)
            },
            {
                path: 'inventario',
                loadComponent: () =>
                    import('src/app/features/dashboard/module-1/inventory/inventory.component').then(c => c.InventoryComponent)
            },
            {
                path: 'asistencias',
                loadComponent: () =>
                    import('src/app/features/dashboard/module-2/show-assistance/show.assistance.component').then(c => c.ShowAssistanceComponent)
            },
            {
                path: 'asistencias-metricas',
                loadComponent: () =>
                    import('src/app/features/dashboard/module-2/metrics/metrics.component').then(c => c.AssistanceMetricComponent)
            },
            {
                path: 'tomar-asistencia',
                loadComponent: () =>
                    import('src/app/features/dashboard/module-2/take-asistance/take-asistance.component').then(c => c.AssistanceComponent)
            },
            {
                path: 'reportes',
                loadComponent: () =>
                    import('src/app/features/dashboard/module-1/reports/report.component').then(c => c.VoucherGuardComponent)
            },
            {
                path: 'autorizar',
                loadComponent: () =>
                    import('src/app/features/dashboard/module-1/autorizaciones/autorizaciones.component').then(c => c.AutorizacionesComponent)
            }
        ]
    },
    {
        path: '**',
        loadComponent: () =>
            import('src/app/features/auth/auth.component').then(c => c.AuthComponent)
    }

];
