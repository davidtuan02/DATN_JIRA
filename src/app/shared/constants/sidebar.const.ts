export const SIDE_MENU = [
    {
        title: 'navbar.ras',
        router: 'ras',
        children: [
            {
                title: 'navbar.ras_config',
                router: 'ras/config'
            },
            {
                title: 'navbar.ras_history',
                router: 'ras/history'
            }
        ]
    },
    {
        title: 'navbar.sam',
        router: 'sam',
        children: [
            {
                title: 'navbar.sam_config',
                router: 'sam/config'
            },
            {
                title: 'navbar.sam_history',
                router: 'sam/history'
            },
            {
                title: 'navbar.sam_info',
                router: 'sam/user-info'
            }
        ]
    }
]